import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation
} from '~/src/api/helpers/schema/common-validations.js'

const deployTestSuiteValidation = Joi.object({
  imageName: repositoryNameValidation,
  environment: environmentValidation
})

export { deployTestSuiteValidation }
