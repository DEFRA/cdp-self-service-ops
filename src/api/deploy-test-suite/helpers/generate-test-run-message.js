import { config } from '~/src/config/index.js'
import {
  cpuValidation,
  environmentValidation,
  memoryValidation,
  repositoryNameValidation,
  runIdValidation,
  userWithUserIdValidation
} from '~/src/api/helpers/schema/common-validations.js'
import Joi from 'joi'

const testRunMessageValidation = Joi.object({
  environment: environmentValidation,
  runId: runIdValidation,
  zone: Joi.string().equal('public'),
  desired_count: Joi.number().equal(1).required(),
  cluster_name: Joi.string().equal('ecs-public'),
  name: repositoryNameValidation,
  image: repositoryNameValidation,
  image_version: Joi.number().equal('latest'),
  port: Joi.number().integer().equal(80).required(),
  task_cpu: cpuValidation,
  task_memory: memoryValidation,
  webdriver_sidecar: Joi.object({
    browser: Joi.string().equal('chrome'),
    version: Joi.string().equal('latest')
  }),
  deployed_by: userWithUserIdValidation,
  environment_variables: Joi.object({
    BASE_URL: Joi.string().required(),
    ENVIRONMENT: environmentValidation
  }).unknown(true)
})

const generateTestRunMessage = (imageName, environment, runId, user) => {
  const message = {
    environment,
    runId,
    zone: 'public',
    desired_count: 1,
    cluster_name: 'ecs-public',
    name: imageName,
    image: imageName,
    image_version: 'latest',
    port: 80,
    task_cpu: 4096,
    task_memory: 8192,
    webdriver_sidecar: {
      browser: 'chrome',
      version: 'latest'
    },
    deployed_by: {
      userId: user.id,
      displayName: user.displayName
    },
    environment_variables: {
      BASE_URL: `https://${environment}.cdp-int.defra.cloud/`,
      ENVIRONMENT: environment,
      HTTP_PROXY: config.get('httpProxy') // Once we support cdp-app-config in test suites this can go
    }
  }

  Joi.assert(message, testRunMessageValidation)

  return message
}

export { generateTestRunMessage }
