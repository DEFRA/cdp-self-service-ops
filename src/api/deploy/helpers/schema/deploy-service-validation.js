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
} from '~/src/api/helpers/schema/common-validations.js'

const deployServiceValidation = Joi.object({
  imageName: repositoryNameValidation,
  version: versionValidation,
  environment: environmentValidation,
  instanceCount: instanceCountValidation,
  cpu: cpuValidation,
  memory: memoryValidation
})

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

export { deployServiceValidation, deploymentValidation }
