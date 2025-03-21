import Joi from 'joi'
import {
  commitShaValidation,
  cpuValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  versionValidation
} from '~/src/api/helpers/schema/common-validations.js'

const deployServiceValidation = Joi.object({
  imageName: repositoryNameValidation,
  version: versionValidation,
  environment: environmentValidation,
  instanceCount: instanceCountValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  configVersion: commitShaValidation
})

export { deployServiceValidation }
