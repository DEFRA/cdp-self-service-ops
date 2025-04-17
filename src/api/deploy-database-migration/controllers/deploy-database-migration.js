import { databaseMigrationRequestValidation } from '~/src/api/deploy-database-migration/helpers/database-migration-request-validation.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'
import { runDatabaseMigration } from '~/src/api/deploy-database-migration/helpers/run-database-migration.js'

export const deployDatabaseMigration = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: databaseMigrationRequestValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { service, version, environment } = request.payload

    const user = await getScopedUser(service, request.auth)
    const snsClient = request.snsClient
    const logger = request.logger

    const migrationId = await runDatabaseMigration({
      service,
      version,
      environment,
      user,
      snsClient,
      logger
    })

    if (!migrationId) {
      return h.response({ message: 'Failed to send SNS message' }).code(500)
    }

    return h.response({ message: 'success', migrationId }).code(200)
  }
}
