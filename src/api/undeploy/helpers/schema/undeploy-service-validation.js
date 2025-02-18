import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation
} from '~/src/api/helpers/schema/common-validations.js'

function undeployServiceValidation() {
  return Joi.object({
    serviceName: repositoryNameValidation,
    environment: environmentValidation
  })
}

export { undeployServiceValidation }
