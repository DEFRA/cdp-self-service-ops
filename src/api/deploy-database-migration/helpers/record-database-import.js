import { config } from '#config/config.js'

import { createLogger } from '../../../helpers/logging/logger.js'
import { fetcher } from '../../../helpers/fetcher.js'
import Joi from 'joi'
import {
  environmentValidation,
  userWithIdValidation,
  migrationVersionValidation,
  migrationIdValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'

const recordImportValidation = Joi.object({
  cdpImportId: migrationIdValidation,
  service: repositoryNameValidation,
  version: migrationVersionValidation,
  environment: environmentValidation,
  importTarget: Joi.string().valid('posgress').required(),
  user: userWithIdValidation
})

/**
 * Record database migration in portal-backend so we can join it up with events.
 * @param {Options} options
 * @returns {Promise<{Response}|Response>}
 */
export async function recordDataImport({
  cdpImportId,
  service,
  environment,
  version,
  target,
  user
}) {
  const logger = createLogger()

  const url = `${config.get('portalBackendUrl')}/imports/runs`

  logger.info(
    `Recording db ${target} import ${service}:${version} in ${environment} run ${cdpImportId} by ${user.displayName}`
  )

  const body = {
    cdpImportId,
    service,
    version,
    environment,
    importTarget: target,
    user
  }

  Joi.assert(body, recordImportValidation)

  return fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}
