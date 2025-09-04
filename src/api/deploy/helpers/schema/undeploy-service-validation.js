import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'

function undeployServiceValidation() {
  return Joi.object({
    serviceName: repositoryNameValidation,
    environment: environmentValidation
  })
}

export { undeployServiceValidation }
