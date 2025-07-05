const { InfluxDB } = require('@influxdata/influxdb-client')

const url = 'http://localhost:8086'
const token = 'njYZ-2HOwYeMX2s4IAAyUeYOEDj_7HSstorcbkNMwTFpNZJLVDBW2cvI8EiRE7Gr271NHeDsHAWN0yIH7ggfIw=='
const org = 'thamer'
const bucket = 'energy_data'

const influxDB = new InfluxDB({ url, token })

const queryApi = influxDB.getQueryApi(org)

const fluxQuery = `
  from(bucket:"${bucket}")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "energy")
`

console.log('Résultats :')

queryApi.queryRows(fluxQuery, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    console.log(`${o._time} - ${o.capteur} - ${o._field}: ${o._value}`)
  },
  error(error) {
    console.error('Erreur:', error)
  },
  complete() {
    console.log('Lecture terminée.')
  },
})
