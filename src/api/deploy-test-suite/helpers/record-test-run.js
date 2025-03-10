import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Joi from 'joi'
import {
  commitShaValidation,
  environmentValidation,
  repositoryNameValidation,
  runIdValidation,
  tagValidation,
  userWithIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const recordTestRunValidation = Joi.object({
  testSuite: repositoryNameValidation,
  tag: tagValidation,
  runId: runIdValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  configVersion: commitShaValidation
})

/**
 *
 * @param {string} imageName
 * @param {string} tag
 * @param {string} runId
 * @param {string} environment
 * @param {{ id: string, displayName: string}} user
 * @param {string} configCommitSha
 * @returns {Promise<{Response}|Response>}
 */
async function recordTestRun(
  imageName,
  tag,
  runId,
  environment,
  user,
  configCommitSha
) {
  const logger = createLogger()

  const url = `${config.get('portalBackendUrl')}/test-run`

  logger.info(
    `Recording test-run for ${imageName} run ${runId} by ${user.displayName}`
  )
  const body = {
    testSuite: imageName,
    tag,
    runId,
    environment,
    user,
    configVersion: configCommitSha
  }

  Joi.assert(body, recordTestRunValidation)

  return fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

export { recordTestRun }
