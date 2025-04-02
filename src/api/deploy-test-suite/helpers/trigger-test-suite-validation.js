import Joi from 'joi'
import {
  cpuValidation,
  environmentValidation,
  memoryValidation,
  repositoryNameValidation,
  userWithIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const triggerTestSuiteValidation = Joi.object({
  imageName: repositoryNameValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  cpu: cpuValidation,
  memory: memoryValidation
})

export { triggerTestSuiteValidation }
