import Joi from 'joi'

import { repositoryNameValidation } from '~/src/api/helpers/schema/common-validations.js'

function createServiceValidationSchema(allowableServiceTemplates) {
  return Joi.object({
    repositoryName: repositoryNameValidation,
    serviceTypeTemplate: Joi.string()
      .valid(...allowableServiceTemplates)
      .required()
      .messages({
        'any.only': 'Choose a service type'
      }),
    teamId: Joi.string().required(),
    templateTag: Joi.string()
      .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_\\.]*[a-zA-Z0-9]$/)
      .allow('')
      .messages({
        'string.pattern.base':
          'Branch or tag name: Alphanumeric characters, fullstops, underscores & hyphens only'
      })
      .optional()
  })
}

export { createServiceValidationSchema }
