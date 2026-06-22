import { config } from '#config/config.js'
import Joi from 'joi'
import {
  cpuValidation,
  currentEnvironmentValidation,
  deploymentIdValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  userWithUserIdValidation,
  versionValidation,
  zoneValidation
} from '@defra/cdp-validation-kit'

const currentEnvironment = config.get('environment')

const gitHubDeploymentValidation = Joi.object({
  deploymentId: deploymentIdValidation,
  deploy: Joi.boolean().required(),
  service: Joi.object({
    name: repositoryNameValidation,
    image: repositoryNameValidation,
    version: versionValidation,
    configuration: Joi.object({
      commitSha: Joi.string().required()
    }),
    serviceCode: Joi.string()
  }),
  cluster: Joi.object({
    environment: environmentValidation,
    zone: zoneValidation
  }),
  resources: Joi.object({
    instanceCount: instanceCountValidation,
    cpu: cpuValidation,
    memory: memoryValidation
  }),
  metadata: Joi.object({
    user: userWithUserIdValidation,
    deploymentEnvironment: currentEnvironmentValidation
  })
})

/**
 * @param {{payload: {imageName: string, version:string, environment: string, instanceCount: number, cpu: number, memory: number}, zone: string, deploymentId: string, commitSha: string, serviceCode: ?string, deploy: ?boolean, user: {id: string, displayName: string}, deploymentEnvironment: ?string}} options
 */
export function generateGitHubDeployment({
  payload: { imageName, version, environment, instanceCount, cpu, memory },
  zone,
  deploymentId,
  commitSha,
  serviceCode,
  deploy,
  user,
  deploymentEnvironment = currentEnvironment
}) {
  const deployment = {
    deploymentId,
    deploy,
    service: {
      name: imageName,
      image: imageName,
      version,
      configuration: {
        commitSha
      },
      serviceCode
    },
    cluster: {
      environment,
      zone
    },
    resources: {
      instanceCount,
      cpu,
      memory
    },
    metadata: {
      user: {
        userId: user.id,
        displayName: user.displayName
      },
      deploymentEnvironment
    }
  }

  Joi.assert(deployment, gitHubDeploymentValidation)

  return deployment
}
/**
 *
 * @param {string} imageName
 * @param {string} version
 * @param {string} environment
 * @param {number} instanceCount
 * @param {number} cpu
 * @param {number} memory
 * @param {string} zone
 * @param {string} deploymentId
 * @param {string} commitSha
 * @param {string} serviceCode
 * @param {{ id: string, displayName: string }} user
 * @return {{name: string, container_port: number, container_image: string, container_version: string, desired_count: number, task_cpu: number, task_memory: number, env_files: [{value: string, type: string},{value: string, type: string},{value: string, type: string},{value: string, type: string}], deployed_by: {deployment_id: string, user_id: string, display_name: string}, zone: string, environment: string, service_code: string, use_new_iam_role: string}}
 */
export function generateLambdaDeployment({
  payload: { imageName, version, environment, instanceCount, cpu, memory },
  zone,
  deploymentId,
  commitSha,
  serviceCode,
  user
}) {
  return {
    name: imageName,
    container_port: 8085,
    container_image: imageName,
    container_version: version,
    desired_count: instanceCount,
    task_cpu: cpu,
    task_memory: memory,
    env_files: [
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/${commitSha}/global/global_protected_fixed.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/${commitSha}/services/${imageName}/${environment}/${imageName}.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/${commitSha}/services/${imageName}/defaults.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/${commitSha}/environments/${environment}/defaults.env`,
        type: 's3'
      }
    ],
    deployed_by: {
      deployment_id: deploymentId,
      user_id: user.id,
      display_name: user.displayName
    },
    zone,
    environment,
    service_code: serviceCode,
    use_new_iam_role: 'false'
  }
}
