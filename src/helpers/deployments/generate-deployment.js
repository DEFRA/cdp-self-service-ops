import { config } from '~/src/config/index.js'
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
} from '@defra/cdp-validation-kit/src/validations.js'

const currentEnvironment = config.get('environment')

const deploymentValidation = Joi.object({
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
export function generateDeployment({
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

  Joi.assert(deployment, deploymentValidation)

  return deployment
}
