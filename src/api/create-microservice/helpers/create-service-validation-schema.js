import Joi from 'joi'
import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'

function createServiceValidationSchema() {
  const serviceTypeTemplates = Object.keys(serviceTemplates)

  return (value, options) => {
    const validationResult = Joi.object({
      repositoryName: Joi.string()
        .pattern(/^[\w-]*$/)
        .pattern(/^[a-zA-Z0-9][\w-]*[a-zA-Z0-9]$/, {
          name: 'startAndEndWithCharacter'
        })
        .min(1)
        .max(96)
        .required()
        .messages({
          'string.empty': 'Enter a service name',
          'string.pattern.base':
            'Letters and numbers with hyphen or underscore separators',
          'string.pattern.name': 'Start and end with a character',
          'string.min': '1 character or more',
          'string.max': '96 characters or less'
        }),
      serviceTypeTemplate: Joi.string()
        .valid(...serviceTypeTemplates)
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
    }).validate(value, options)

    if (validationResult?.error) {
      const errorDetail = validationResult.error.details
        .map(
          (errorDetails) =>
            `${errorDetails.path.at(0)} - ${errorDetails.message.replace(
              /"/g,
              "'"
            )}`
        )
        .join(', ')

      throw Boom.badRequest(errorDetail)
    }

    return validationResult.value
  }
}

export { createServiceValidationSchema }
