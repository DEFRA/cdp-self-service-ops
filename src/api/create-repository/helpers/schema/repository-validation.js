import Joi from 'joi'

import { repositoryVisibility } from '~/src/api/create-repository/constants/repository-visibility'

const repositoryValidation = Joi.object({
  repositoryName: Joi.string()
    .pattern(/^[\w-]*$/)
    .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, {
      name: 'startAndEndWithCharacter'
    })
    .min(1)
    .max(32)
    .required()
    .messages({
      'string.empty': 'Enter repository name',
      'string.pattern.base': 'Letters and numbers with hyphen separators',
      'string.pattern.name': 'Start and end with a character',
      'string.min': '1 character or more',
      'string.max': '32 characters or less'
    }),
  repositoryVisibility: Joi.string()
    .valid(...repositoryVisibility)
    .messages({
      'any.only': 'Choose repository visibility',
      'any.required': 'Choose repository visibility'
    })
    .required(),
  teamId: Joi.string()
    .messages({
      'any.required': 'Choose owning team'
    })
    .required()
})

export { repositoryValidation }
