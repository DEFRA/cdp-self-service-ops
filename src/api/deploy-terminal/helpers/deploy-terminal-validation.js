import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation
} from '~/src/api/helpers/schema/common-validations.js'

export const deployTerminalValidation = () => {
  return Joi.object({
    service: repositoryNameValidation,
    environment: environmentValidation
  })
}
