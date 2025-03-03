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
  }).unknown(true),
  environment_files: Joi.array()
    .items(
      Joi.object({
        value: Joi.string().required(),
        type: Joi.string().equal('s3').required()
      })
    )
    .length(4)
    .required()
})

/**
 *
 * @param {string} imageName
 * @param {string} environment
 * @param {string} runId
 * @param {{id:string, displayName: string}} user
 * @param {string} configCommitSha
 * @returns {{cluster_name: string, image, desired_count: number, webdriver_sidecar: {browser: string, version: string}, image_version: string, environment_files: [{type: string, value: string},{type: string, value: string},{type: string, value: string},{type: string, value: string}], environment_variables: {ENVIRONMENT, BASE_URL: string, HTTP_PROXY: never}, environment, zone: string, port: number, name, task_memory: number, runId, deployed_by: {displayName, userId}, task_cpu: number}}
 */
const generateTestRunMessage = (
  imageName,
  environment,
  runId,
  user,
  configCommitSha
) => {
  const basePath = configCommitSha
    ? `arn:aws:s3:::cdp-${environment}-service-configs/${configCommitSha}`
    : `arn:aws:s3:::cdp-${environment}-service-configs`

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
    },
    environment_files: [
      {
        value: `${basePath}/global/global_fixed.env`,
        type: 's3'
      },
      {
        value: `${basePath}/services/${imageName}/${environment}/${imageName}.env`,
        type: 's3'
      },
      {
        value: `${basePath}/services/${imageName}/defaults.env`,
        type: 's3'
      },
      {
        value: `${basePath}/environments/${environment}/defaults.env`,
        type: 's3'
      }
    ]
  }

  Joi.assert(message, testRunMessageValidation)

  return message
}

export { generateTestRunMessage }
