import { config } from '../../../config/index.js'
import {
  cpuValidation,
  deploymentIdValidation,
  environmentValidation,
  memoryValidation,
  repositoryNameValidation,
  runIdValidation,
  userWithUserIdValidation,
  versionValidation
} from '@defra/cdp-validation-kit'
import Joi from 'joi'

const testRunMessageValidation = Joi.object({
  environment: environmentValidation,
  runId: runIdValidation,
  zone: Joi.string().equal('public'),
  desired_count: Joi.number().equal(1).required(),
  cluster_name: Joi.string().equal('ecs-public'),
  name: repositoryNameValidation,
  image: repositoryNameValidation,
  image_version: versionValidation,
  port: Joi.number().integer().equal(80).required(),
  task_cpu: cpuValidation,
  task_memory: memoryValidation,
  webdriver_sidecar: Joi.object({
    browser: Joi.string().equal('chrome'),
    version: Joi.string().equal('latest')
  }),
  deployment: {
    deploymentId: deploymentIdValidation,
    version: versionValidation,
    service: repositoryNameValidation
  },
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
 * @typedef {{environment, runId, zone: string, desired_count: number, cluster_name: string, name, image, image_version, port: number, task_cpu, task_memory, webdriver_sidecar: {browser: string, version: string}, deployed_by: {userId, displayName}, environment_variables: {BASE_URL: string, ENVIRONMENT, HTTP_PROXY: never}, environment_files: [{value: string, type: string},{value: string, type: string},{value: string, type: string},{value: string, type: string}]}} TestRunMessage
 */

/**
 * @typedef {object} Options
 * @property {string} testSuite
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
 * Generate the test run message for the SNS topic
 * @param {Options} options
 * @returns {TestRunMessage}
 */
const generateTestRunMessage = ({
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
}) => {
  const basePath = configCommitSha
    ? `arn:aws:s3:::cdp-${environment}-service-configs/${configCommitSha}`
    : `arn:aws:s3:::cdp-${environment}-service-configs`

  const message = {
    environment,
    runId,
    zone: 'public',
    desired_count: 1,
    cluster_name: 'ecs-public',
    name: testSuite,
    image: testSuite,
    image_version: tag,
    port: 80,
    task_cpu: cpu,
    task_memory: memory,
    webdriver_sidecar: {
      browser: 'chrome',
      version: 'latest'
    },
    deployed_by: {
      userId: user.id,
      displayName: user.displayName
    },
    deployment,
    environment_variables: {
      BASE_URL: `https://${environment}.cdp-int.defra.cloud/`,
      ENVIRONMENT: environment,
      HTTP_PROXY: config.get('httpProxy'), // Once we support cdp-app-config in test suites this can go,
      PROFILE: profile
    },
    environment_files: [
      {
        value: `${basePath}/global/global_fixed.env`,
        type: 's3'
      },
      {
        value: `${basePath}/services/${testSuite}/${environment}/${testSuite}.env`,
        type: 's3'
      },
      {
        value: `${basePath}/services/${testSuite}/defaults.env`,
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
