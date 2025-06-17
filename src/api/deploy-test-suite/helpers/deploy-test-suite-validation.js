import Joi from 'joi'
import {
  cpuValidation,
  environmentValidation,
  memoryValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'

const deployTestSuiteValidation = Joi.object({
  imageName: repositoryNameValidation,
  environment: environmentValidation,
  cpu: cpuValidation,
  memory: memoryValidation
})

export { deployTestSuiteValidation }
