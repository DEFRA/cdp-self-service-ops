import { statusCodes } from '@defra/cdp-validation-kit'
import { startImportRequestValidation } from '../helpers/deploy-migration-request-validation.js'
import { runDatabaseImport } from '../helpers/run-database-import.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { dirname, basename } from 'path'
import userHasBreakGlass from '../../../helpers/user/user-has-break-glass.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'

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

    // While it's still in development it's restricted to admins
    if (!auth?.credentials?.scopeFlags?.isAdmin) {
      return h
        .response({ message: 'Restricted to admin only' })
        .code(statusCodes.badRequest)
    }

    const entity = await getEntity(service, logger)

    if (
      environment === 'prod' &&
      !userHasBreakGlass(auth?.credentials, entity)
    ) {
      return h
        .response({ message: 'Break-glass required' })
        .code(statusCodes.badRequest)
    }

    const bucket = `cdp-${environment}-imports`

    // Split up path
    const dataFolder = `${bucket}/${service}/${dirname(path)}/` // bucket name + path, no prefix
    const fileName = `./${basename(path)}` // file gets mounted into the base dir

    const commands = []
    switch (target) {
      case 'postgres':
        commands.push(
          'export PGPASSWORD=$(aws rds generate-db-auth-token --hostname $PGHOST --port $PGPORT --region $REGION --username $PGUSER)'
        )
        commands.push(
          // eslint-disable-next-line no-template-curly-in-string
          'export PGDATABASE="${PGDATABASE:=$(echo "$SERVICE" | tr \'-\' \'_\')}"'
        )
        commands.push(
          `/usr/bin/pg_restore -d postgresql://$PGHOST/$PGDATABASE --data-only ${fileName} --single-transaction`
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
