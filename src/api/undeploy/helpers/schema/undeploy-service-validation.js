import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'

function undeployServiceValidation() {
  return Joi.object({
    serviceName: repositoryNameValidation,
    environment: environmentValidation
  })
}

export { undeployServiceValidation }
