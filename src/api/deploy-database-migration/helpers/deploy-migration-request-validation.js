import Joi from 'joi'
import {
  environmentValidation,
  migrationIdValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'

const deployMigrationRequestValidation = Joi.object({
  service: repositoryNameValidation,
  version: migrationIdValidation,
  environment: environmentValidation
})

export { deployMigrationRequestValidation }
