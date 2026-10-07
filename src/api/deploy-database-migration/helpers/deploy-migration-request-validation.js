import Joi from 'joi'
import {
  environmentValidation,
  migrationIdValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'

export const deployMigrationRequestValidation = Joi.object({
  service: repositoryNameValidation,
  version: migrationIdValidation,
  environment: environmentValidation
})

export const startImportRequestValidation = Joi.object({
  service: repositoryNameValidation,
  environment: environmentValidation,
  path: Joi.string().required(),
  target: Joi.string().valid('postgres', 'mongo').default('postgres')
})
