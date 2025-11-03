import { statusCodes } from '@defra/cdp-validation-kit'
import { deployMigrationRequestValidation } from '../helpers/deploy-migration-request-validation.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { runDatabaseMigration } from '../helpers/run-database-migration.js'

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
    const { payload, auth, snsClient, logger } = request
    const { service, version, environment } = payload

    const user = await getScopedUser(service, auth, logger)

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

    return h.response({ migrationId }).code(statusCodes.ok)
  }
}
