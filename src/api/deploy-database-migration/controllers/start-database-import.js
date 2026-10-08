import { statusCodes } from '@defra/cdp-validation-kit'
import { startImportRequestValidation } from '../helpers/deploy-migration-request-validation.js'
import { runDatabaseImport } from '../helpers/run-database-import.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { dirname, basename } from 'path'

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
    const { service, environment, path, target } = payload

    // While it's still in development it's restricted to infra-dev
    if (environment !== 'infra-dev') {
      return h
        .response({ message: 'Restricted to infra-dev only' })
        .code(statusCodes.badRequest)
    }
    // TODO: Get from config
    const bucket = 'cdp-infra-dev-database-migrations'

    // Split up path
    const dataFolder = `${bucket}/${service}/imports/${dirname(path)}/` // bucket name + path, no prefix
    const fileName = `./${basename(path)}` // file gets mounted into the base dir

    const commands = []
    switch (target) {
      case 'postgres':
        // TODO: fetch the entity, check it has a database & estimate the cores (ACU / 4 roughly) and set -j accordingly
        commands.push(
          'export PGPASSWORD=$(aws rds generate-db-auth-token --hostname $PGHOST --port $PGPORT --region $REGION --username $PGUSER)'
        )
        commands.push(
          // eslint-disable-next-line no-template-curly-in-string
          'export PGDATABASE="${PGDATABASE:=$(echo "$SERVICE" | tr \'-\' \'_\')}"'
        )
        commands.push(
          `/usr/bin/pg_restore -d postgresql://$PGHOST/$PGDATABASE --data-only ${fileName}`
        )
        break
      default:
        return h
          .response({ message: `Unsupported import target ${target}` })
          .code(statusCodes.badRequest)
    }

    const user = await getScopedUser(service, auth, logger)

    const importId = await runDatabaseImport({
      service,
      environment,
      path,
      user,
      dataFolder,
      target,
      commands,
      snsClient,
      logger
    })

    if (!importId) {
      return h
        .response({ message: 'Failed to send SNS message' })
        .code(statusCodes.internalError)
    }

    return h.response({ importId }).code(statusCodes.ok)
  }
}
