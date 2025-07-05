const { Kafka } = require('kafkajs');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { bucket, org, url, token } = require('./influxdb');

const kafka = new Kafka({
  clientId: 'energy-producer',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket);

async function sendToKafkaContinuously() {
  await producer.connect();

  setInterval(async () => {
    const message = {
      capteur: `lampadaire_${Math.floor(Math.random() * 3) + 1}`,
      puissance: Math.random() * 100,
      energieVerte: Math.random() * 100,
      timestamp: new Date().toISOString(),
    };

    const point = new Point('energy')
      .tag('capteur', message.capteur)
      .floatField('puissance', message.puissance)
      .floatField('energieVerte', message.energieVerte)
      .timestamp(new Date(message.timestamp));

    writeApi.writePoint(point);
    await writeApi.flush();

    await producer.send({
      topic: 'energy-topic',
      messages: [{ value: JSON.stringify(message) }],
    });

    console.log(`Message envoyé à Kafka et InfluxDB : ${JSON.stringify(message)}`);
  }, 5000); // Toutes les 5 secondes
}

sendToKafkaContinuously().catch((error) => {
  console.error('Erreur producer:', error);
});