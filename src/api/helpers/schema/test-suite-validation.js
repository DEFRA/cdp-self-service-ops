import Joi from 'joi'
import {
  repositoryNameValidation,
  teamIdValidation
} from '@defra/cdp-validation-kit/src/validations.js'

const testSuiteValidation = Joi.object({
  repositoryName: repositoryNameValidation,
  teamId: teamIdValidation
    .messages({
      'any.required': 'Choose owning team'
    })
    .required(),
  templateTag: Joi.string()
    .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_\\.]*[a-zA-Z0-9]$/)
    .allow('')
    .messages({
      'string.pattern.base':
        'Branch or tag name: Alphanumeric characters, fullstops, underscores & hyphens only'
    })
    .optional()
})

export { testSuiteValidation }
