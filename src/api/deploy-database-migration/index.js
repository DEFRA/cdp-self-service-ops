import { deployDatabaseMigration } from './controllers/deploy-database-migration.js'
import { startDatabaseImport } from './controllers/start-database-import.js'

export const databaseMigrations = {
  plugin: {
    name: 'deploy-database-migration',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/deploy-database-migration',
          ...deployDatabaseMigration
        },
        {
          method: 'POST',
          path: '/start-database-import',
          ...startDatabaseImport
        }
      ])
    }
  }
}
