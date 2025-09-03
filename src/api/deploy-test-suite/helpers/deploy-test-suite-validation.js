import Joi from 'joi'
import {
  cpuValidation,
  environmentValidation,
  memoryValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'

const deployTestSuiteValidation = Joi.object({
  imageName: repositoryNameValidation,
  environment: environmentValidation,
  cpu: cpuValidation,
  memory: memoryValidation
})

export { deployTestSuiteValidation }
