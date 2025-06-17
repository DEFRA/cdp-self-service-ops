import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'

export const deployTerminalValidation = () => {
  return Joi.object({
    service: repositoryNameValidation,
    environment: environmentValidation
  })
}
