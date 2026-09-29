import Joi from 'joi'
import {
  commitShaValidation,
  cpuValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  versionValidation
} from '@defra/cdp-validation-kit'

export const deployServiceValidation = Joi.object({
  imageName: repositoryNameValidation,
  version: versionValidation,
  environment: environmentValidation,
  instanceCount: instanceCountValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  configVersion: commitShaValidation
})
