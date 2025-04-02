import Joi from 'joi'
import {
  cpuValidation,
  environmentValidation,
  memoryValidation,
  repositoryNameValidation
} from '~/src/api/helpers/schema/common-validations.js'

const deployTestSuiteValidation = Joi.object({
  imageName: repositoryNameValidation,
  environment: environmentValidation,
  cpu: cpuValidation,
  memory: memoryValidation
})

export { deployTestSuiteValidation }
