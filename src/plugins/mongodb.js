import { MongoClient } from 'mongodb'
import { LockManager } from 'mongo-locks'

const mongoDb = {
  plugin: {
    name: 'mongoDb',
    version: '1.0.0',
    register: async function (server, options) {
      server.logger.info('Setting up mongodb')

      const client = await MongoClient.connect(options.mongoUrl, {
        ...options.mongoOptions,
        ...(server.secureContext && { secureContext: server.secureContext })
      })

      const { databaseName } = options
      const db = client.db(databaseName)
      const locker = new LockManager(db.collection('mongo-locks'))

      await createIndexes(db)

      server.logger.info(`mongodb connected to ${databaseName}`)

      server.decorate('server', 'mongoClient', client)
      server.decorate('request', 'mongoClient', client)

      server.decorate('server', 'db', db)
      server.decorate('request', 'db', db)

      server.decorate('server', 'locker', locker)
      server.decorate('request', 'locker', locker)

      server.events.on('stop', () => {
        server.logger.info('Closing Mongo client')
        return client.close(true)
      })
    }
  }
}

async function createIndexes(db) {
  await db
    .collection('status')
    .createIndex({ repositoryName: 1 }, { unique: true })
  await db.collection('status').createIndex({ repositoryName: 1, status: 1 })
  await db.collection('mongo-locks').createIndex({ id: 1 })
}

export { mongoDb, createIndexes }
