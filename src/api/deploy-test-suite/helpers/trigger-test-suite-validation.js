import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation,
  userWithIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const triggerTestSuiteValidation = Joi.object({
  imageName: repositoryNameValidation,
  environment: environmentValidation,
  user: userWithIdValidation
})

export { triggerTestSuiteValidation }
