const { InfluxDB } = require('@influxdata/influxdb-client');

const url = 'http://localhost:8086';
const token = 'njYZ-2HOwYeMX2s4IAAyUeYOEDj_7HSstorcbkNMwTFpNZJLVDBW2cvI8EiRE7Gr271NHeDsHAWN0yIH7ggfIw==';
const org = 'thamer';
const bucket = 'energy_data';

const influxDB = new InfluxDB({ url, token });
const queryApi = influxDB.getQueryApi(org);
const writeApi = influxDB.getWriteApi(org, bucket);

module.exports = { influxDB, queryApi, writeApi, bucket, org, url, token };