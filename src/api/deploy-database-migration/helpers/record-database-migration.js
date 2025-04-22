import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation,
  userWithIdValidation,
  migrationVersionValidation,
  migrationIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

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

  const url = `${config.get('portalBackendUrl')}/migrations/run`

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
// "{\"service\":\"some-service\",\"environment\":\"infra-dev\",\"user\":{\"id\":\"some-id\",\"displayName\":\"My Name\"},\"version\":\"1.1.0\",\"cdpMigrationId\":\"e5b0a28c-4978-4550-b611-f961152cc75a\"}",
// "{\"service\":\"some-service\",\"environment\":\"infra-dev\",\"version\":\"1.1.0\",\"user\":{\"id\":\"some-id\",\"displayName\":\"My Name\", {\"cdpMigrationId\":\"e5b0a28c-4978-4550-b611-f961152cc75a\"}}"
