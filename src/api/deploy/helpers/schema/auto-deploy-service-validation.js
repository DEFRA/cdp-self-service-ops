import Joi from 'joi'
import {
  commitShaValidation,
  cpuValidation,
  environmentExceptForProdValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  userWithIdValidation,
  versionValidation
} from '@defra/cdp-validation-kit/src/validations.js'

const autoDeployServiceValidation = Joi.object({
  imageName: repositoryNameValidation,
  version: versionValidation,
  environment: environmentExceptForProdValidation,
  user: userWithIdValidation,
  instanceCount: instanceCountValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  configVersion: commitShaValidation
})

export { autoDeployServiceValidation }
