const { Kafka } = require('kafkajs');
const WebSocket = require('ws');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { bucket, org, url, token } = require('./influxdb');

const kafka = new Kafka({
  clientId: 'energy-consumer',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'energy-group' });
const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket);
const wss = new WebSocket.Server({ port: 8081 }, () => {
  console.log('Serveur WebSocket démarré sur ws://localhost:8081');
});

wss.on('connection', (ws) => {
  console.log('Client WebSocket connecté');
  ws.on('close', () => console.log('Client WebSocket déconnecté'));
  ws.on('error', (error) => console.error('Erreur WebSocket client:', error));
});

async function consumeFromKafka() {
  try {
    await consumer.connect();
    console.log('Consumer connecté à Kafka');
    await consumer.subscribe({ topic: 'energy-topic', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`Message reçu de Kafka :`, { topic, partition, value: data });

          const point = new Point('energy')
            .tag('capteur', data.capteur)
            .floatField('puissance', data.puissance)
            .floatField('energieVerte', data.energieVerte)
            .timestamp(new Date(data.timestamp));
          writeApi.writePoint(point);
          await writeApi.flush();

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        } catch (error) {
          console.error('Erreur lors du traitement du message Kafka:', error);
        }
      },
    });
  } catch (error) {
    console.error('Erreur de connexion du consumer:', error);
  }
}

consumeFromKafka();

process.on('SIGTERM', async () => {
  console.log('Arrêt du consumer...');
  await consumer.disconnect();
  await writeApi.close();
  wss.close();
  process.exit(0);
});