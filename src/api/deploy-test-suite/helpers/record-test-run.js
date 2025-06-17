import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Joi from 'joi'
import {
  commitShaValidation,
  environmentValidation,
  runIdValidation,
  versionValidation,
  userWithIdValidation,
  cpuValidation,
  memoryValidation,
  deploymentIdValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'

const recordTestRunValidation = Joi.object({
  testSuite: repositoryNameValidation,
  environment: environmentValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  user: userWithIdValidation,
  tag: versionValidation,
  runId: runIdValidation,
  configVersion: commitShaValidation,
  deployment: {
    deploymentId: deploymentIdValidation,
    version: versionValidation,
    service: repositoryNameValidation
  }
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
  deployment,
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
    deployment,
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
