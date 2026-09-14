import { statusCodes } from '@defra/cdp-validation-kit'
import { startImportRequestValidation } from '../helpers/deploy-migration-request-validation.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { runDatabaseImport } from '../helpers/run-database-import.js'

export const startDatabaseImport = {
  options: {
    // Auth disabled for testing
    validate: {
      payload: startImportRequestValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { payload, auth, snsClient, logger } = request
    const { service, environment, dataFolder, commands } = payload

    if (environment !== 'infra-dev') {
      return h
        .response({ message: 'Restricted to infra-dev only' })
        .code(statusCodes.badRequest)
    }

    const user = await getScopedUser(service, auth, logger)

    const migrationId = await runDatabaseImport({
      service,
      environment,
      user,
      dataFolder,
      commands,
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
