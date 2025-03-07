import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Joi from 'joi'
import {
  commitShaValidation,
  environmentValidation,
  repositoryNameValidation,
  runIdValidation,
  userWithIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const recordTestRunValidation = Joi.object({
  testSuite: repositoryNameValidation,
  runId: runIdValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  configVersion: commitShaValidation
})

async function recordTestRun(
  imageName,
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
