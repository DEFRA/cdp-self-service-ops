import Joi from 'joi'
import {
  environmentValidation,
  migrationIdValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'

const deployMigrationRequestValidation = Joi.object({
  service: repositoryNameValidation,
  version: migrationIdValidation,
  environment: environmentValidation
})

export { deployMigrationRequestValidation }
