import Joi from 'joi'
import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/createV2/helpers/service-templates'

function createServiceValidationSchema() {
  const serviceTypeTemplates = Object.keys(serviceTemplates)

  return async (value, options) => {
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
      teamId: Joi.string().required()
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
