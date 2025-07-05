const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const url = 'http://localhost:8086';
const token = 'njYZ-2HOwYeMX2s4IAAyUeYOEDj_7HSstorcbkNMwTFpNZJLVDBW2cvI8EiRE7Gr271NHeDsHAWN0yIH7ggfIw==';
const org = 'thamer';
const bucket = 'energy_data';

const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket);
writeApi.useDefaultTags({ app: 'test-script' });

const point = new Point('energy')
  .tag('capteur', 'lampadaire_1')
  .floatField('puissance', 42.5);

writeApi.writePoint(point);
writeApi.close().then(() => {
  console.log('✅ Donnée écrite avec succès dans InfluxDB.');
}).catch(e => {
  console.error('❌ Erreur :', e);
});
