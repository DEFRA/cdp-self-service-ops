import { config } from '../../../config/index.js'

import { createLogger } from '../../../helpers/logging/logger.js'
import { fetcher } from '../../../helpers/fetcher.js'
import Joi from 'joi'
import {
  repositoryNameValidation,
  environmentValidation,
  userWithIdValidation
} from '@defra/cdp-validation-kit'

const recordTerminalSessionValidation = Joi.object({
  token: Joi.string().min(1).required(),
  environment: environmentValidation.required(),
  service: repositoryNameValidation.required(),
  user: userWithIdValidation.required()
})

/**
 * @typedef {object} Options
 * @property {string} imageName
 * @property {string} environment
 * @property {string} cpu
 * @property {string} memory
 * @property {{id: string, displayName: string}} user
 * @property {{deploymentId: string, service: string, version: string}} deployment
 * @property {string} tag
 * @property {string} runId
 * @property {string} configCommitSha
 */

/**
 * Record terminal session in portal backend
 * @param {{ token: string, environment: string, service: string, user: {displayName: string, id: string} }} session
 * @returns {Promise<{Response}|Response>}
 */
function recordTerminalSession(session) {
  const logger = createLogger()

  Joi.assert(session, recordTerminalSessionValidation)

  const url = `${config.get('portalBackendUrl')}/terminals`

  logger.info(
    `Recording terminal session for ${session.environment}/${session.service} by ${session.user.displayName}`
  )

  return fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(session)
  })
}

export { recordTerminalSession }
