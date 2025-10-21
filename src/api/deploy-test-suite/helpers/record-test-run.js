import { config } from '../../../config/index.js'

import { createLogger } from '../../../helpers/logging/logger.js'
import { fetcher } from '../../../helpers/fetcher.js'
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
  repositoryNameValidation,
  profileValidation
} from '@defra/cdp-validation-kit'

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
  },
  profile: profileValidation
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
  testSuite,
  environment,
  cpu,
  memory,
  user,
  deployment,
  tag,
  runId,
  configCommitSha,
  profile
}) {
  const logger = createLogger()

  logger.info(
    `Recording test-run for ${testSuite} run ${runId} by ${user.displayName} with profile ${profile} in ${environment}`
  )
  const body = {
    testSuite,
    environment,
    cpu,
    memory,
    user,
    deployment,
    tag,
    runId,
    configVersion: configCommitSha,
    profile
  }

  Joi.assert(body, recordTestRunValidation)

  const url = `${config.get('portalBackendUrl')}/test-run`
  return fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

export { recordTestRun }
