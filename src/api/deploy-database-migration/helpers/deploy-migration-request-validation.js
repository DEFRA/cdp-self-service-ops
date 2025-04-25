import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation,
  migrationIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const deployMigrationRequestValidation = Joi.object({
  service: repositoryNameValidation,
  version: migrationIdValidation,
  environment: environmentValidation
})

export { deployMigrationRequestValidation }
