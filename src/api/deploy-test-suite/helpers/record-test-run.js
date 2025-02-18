import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation,
  runIdValidation,
  userWithUserIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const createTestRunValidation = Joi.object({
  testSuite: repositoryNameValidation,
  runId: runIdValidation,
  environment: environmentValidation,
  user: userWithUserIdValidation
})

async function createRecordTestRun(imageName, runId, environment, user) {
  const logger = createLogger()

  const url = `${config.get('portalBackendUrl')}/test-run`

  logger.info(
    `Recording  test-run for ${imageName} run ${runId} by ${user.displayName}`
  )
  const body = {
    testSuite: imageName,
    runId,
    environment,
    user
  }

  Joi.assert(body, createTestRunValidation)

  return fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

export { createRecordTestRun }
