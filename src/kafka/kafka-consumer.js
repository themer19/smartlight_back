// kafka-consumer.js
const { Kafka } = require('kafkajs');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'energy-group' });

const influx = new InfluxDB({ url: 'http://localhost:8086', token: 'ton-token' });
const writeApi = influx.getWriteApi('ton-org', 'ton-bucket');
writeApi.useDefaultTags({ region: 'smart-city' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'energy_metrics', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      const point = new Point('energy')
        .tag('capteur', data.capteur)
        .floatField('puissance', data.puissance);

      writeApi.writePoint(point);
      console.log('Écrit dans InfluxDB:', data);
    },
  });
}

run().catch(console.error);
