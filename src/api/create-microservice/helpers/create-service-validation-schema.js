import Joi from 'joi'
import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'
import { repositoryNameValidation } from '~/src/api/helpers/schema/common-validations.js'

function createServiceValidationSchema() {
  const serviceTypeTemplates = Object.keys(serviceTemplates)

  return (value, options) => {
    const validationResult = Joi.object({
      repositoryName: repositoryNameValidation,
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
