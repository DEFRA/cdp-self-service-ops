import { deployMigrationRequestValidation } from '../helpers/deploy-migration-request-validation.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { runDatabaseMigration } from '../helpers/run-database-migration.js'
import { statusCodes } from '../../../constants/status-codes.js'

export const deployDatabaseMigration = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployMigrationRequestValidation
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
      return h
        .response({ message: 'Failed to send SNS message' })
        .code(statusCodes.internalError)
    }

    return h.response({ message: 'success', migrationId }).code(statusCodes.ok)
  }
}
