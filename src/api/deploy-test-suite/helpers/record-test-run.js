import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Joi from 'joi'
import {
  commitShaValidation,
  environmentValidation,
  repositoryNameValidation,
  runIdValidation,
  versionValidation,
  userWithIdValidation,
  cpuValidation,
  memoryValidation
} from '~/src/api/helpers/schema/common-validations.js'

const recordTestRunValidation = Joi.object({
  testSuite: repositoryNameValidation,
  environment: environmentValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  user: userWithIdValidation,
  tag: versionValidation,
  runId: runIdValidation,
  configVersion: commitShaValidation
})

/**
 * @typedef {object} Options
 * @property {string} imageName
 * @property {string} environment
 * @property {string} cpu
 * @property {string} memory
 * @property {{id: string, displayName: string}} user
 * @property {string} tag
 * @property {string} runId
 * @property {string} configCommitSha
 */

/**
 * Record test run in the portal backend
 * @param {Options} options
 * @returns {Promise<{Response}|Response>}
 */
async function recordTestRun({
  imageName,
  environment,
  cpu,
  memory,
  user,
  tag,
  runId,
  configCommitSha
}) {
  const logger = createLogger()

  const url = `${config.get('portalBackendUrl')}/test-run`

  logger.info(
    `Recording test-run for ${imageName} run ${runId} by ${user.displayName}`
  )
  const body = {
    testSuite: imageName,
    environment,
    cpu,
    memory,
    user,
    tag,
    runId,
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
