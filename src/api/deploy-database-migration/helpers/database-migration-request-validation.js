import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation,
  userWithIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const databaseMigrationRequestValidation = Joi.object({
  service: repositoryNameValidation,
  version: Joi.string().required(),
  environment: environmentValidation,
  user: userWithIdValidation
})

export { databaseMigrationRequestValidation }
