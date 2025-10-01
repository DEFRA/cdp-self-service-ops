import Joi from 'joi'

import {
  repositoryNameValidation,
  teamIdValidation
} from '@defra/cdp-validation-kit'
import { tenantTemplates } from './templates.js'

function createTenantValidationSchema() {
  const templateIds = Object.values(tenantTemplates).map((t) => t.id)
  return Joi.object({
    repositoryName: repositoryNameValidation,
    serviceTypeTemplate: Joi.string()
      .valid(...templateIds)
      .required()
      .messages({
        'any.only': 'Choose a service type'
      }),
    teamId: teamIdValidation,
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

export { createTenantValidationSchema }
