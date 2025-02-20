import Joi from 'joi'
import {
  cpuValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  userWithIdValidation,
  versionValidation
} from '~/src/api/helpers/schema/common-validations.js'

const autoDeployServiceValidation = Joi.object({
  imageName: repositoryNameValidation,
  version: versionValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  instanceCount: instanceCountValidation,
  cpu: cpuValidation,
  memory: memoryValidation
})

export { autoDeployServiceValidation }
