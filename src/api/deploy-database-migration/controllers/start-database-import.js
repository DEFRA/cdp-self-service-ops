import { statusCodes } from '@defra/cdp-validation-kit'
import { startImportRequestValidation } from '../helpers/deploy-migration-request-validation.js'
import { runDatabaseImport } from '../helpers/run-database-import.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import path from 'path'

export const startDatabaseImport = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
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
    const { payload, snsClient, auth, logger } = request
    const { service, environment, s3File, target } = payload

    // While it's still in development it's restricted to infra-dev
    if (environment !== 'infra-dev') {
      return h
        .response({ message: 'Restricted to infra-dev only' })
        .code(statusCodes.badRequest)
    }

    // Split up the S3 URL
    const s3Url = new URL(s3File) // assumes a full S3://bucket/path/file.ext url
    const dataFolder = s3Url.hostname + path.dirname(s3Url.pathname) // bucket name + path, no prefix
    const fileName = './' + path.basename(s3Url.pathname) // file gets mounted into the base dir

    const commands = []
    switch (target) {
      case 'postgres':
        // TODO: fetch the entity, check it has a database & estimate the cores (ACU / 4 roughly) and set -j accordingly
        commands.push(
          'export PGPASSWORD=$(aws rds generate-db-auth-token --hostname $PGHOST --port $PGPORT --region $REGION --username $PGUSER)'
        )
        commands.push(`pg_restore --data-only ${fileName}`)
        break
      default:
        return h
          .response({ message: `Unsupported import target ${target}` })
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
