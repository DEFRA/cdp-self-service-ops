import { MongoClient } from 'mongodb'
import { config } from '~/src/config'

const mongoPlugin = {
  name: 'mongodb',
  version: '1.0.0',
  register: async function (server) {
    const mongoOptions = {
      retryWrites: false,
      readPreference: 'secondary',
      tlsAllowInvalidCertificates: true, // TODO: use the trust store
      tlsAllowInvalidHostnames: true
    }

    const mongoUrl = new URL(config.get('mongoUri'))
    const databaseName = config.get('mongoDatabase')

    server.logger.info('Setting up mongodb')

    const client = await MongoClient.connect(mongoUrl.toString(), mongoOptions)
    const db = client.db(databaseName)
    await createIndexes(db)

    server.logger.info(`mongodb connected to ${databaseName}`)
    server.decorate('server', 'mongoClient', client)
    server.decorate('server', 'db', db)
    server.decorate('request', 'db', db)
  }
}

const createIndexes = async (db) => {
  await db.collection('status').createIndex({ repositoryName: 1 })
}

export { mongoPlugin }
