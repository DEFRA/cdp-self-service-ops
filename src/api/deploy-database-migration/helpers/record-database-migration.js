import { config } from '../../../config/index.js'

import { createLogger } from '../../../helpers/logging/logger.js'
import { fetcher } from '../../../helpers/fetcher.js'
import Joi from 'joi'
import {
  environmentValidation,
  userWithIdValidation,
  migrationVersionValidation,
  migrationIdValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'

const recordMigrationValidation = Joi.object({
  cdpMigrationId: migrationIdValidation,
  service: repositoryNameValidation,
  version: migrationVersionValidation,
  environment: environmentValidation,
  user: userWithIdValidation
})

/**
 * @typedef {object} Payload
 * @property {string} cdpMigrationId
 * @property {string} service
 * @property {string} version
 * @property {string} environment
 * @property {{id: string, displayName: string}} user
 */

/**
 * Record database migration in portal-backend so we can join it up with events.
 * @param {Options} options
 * @returns {Promise<{Response}|Response>}
 */
export async function recordDatabaseMigration({
  cdpMigrationId,
  service,
  environment,
  version,
  user
}) {
  const logger = createLogger()

  const url = `${config.get('portalBackendUrl')}/migrations/runs`

  logger.info(
    `Recording db migration ${service}:${version} in ${environment} run ${cdpMigrationId} by ${user.displayName}`
  )

  const body = {
    cdpMigrationId,
    service,
    version,
    environment,
    user
  }

  Joi.assert(body, recordMigrationValidation)

  return fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}
