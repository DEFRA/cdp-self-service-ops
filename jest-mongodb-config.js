module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      skipMD5: true
    },
    autoStart: false,
    instance: {
      dbName: 'cdp-self-service-ops'
    }
  },
  mongoURLEnvName: 'MONGO_URI'
}
