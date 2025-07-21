import { deployDatabaseMigration } from './controllers/deploy-database-migration.js'

export const databaseMigrations = {
  plugin: {
    name: 'deploy-database-migration',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/deploy-database-migration',
          ...deployDatabaseMigration
        }
      ])
    }
  }
}
