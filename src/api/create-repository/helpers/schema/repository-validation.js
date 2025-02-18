import Joi from 'joi'

import { repositoryVisibility } from '~/src/api/create-repository/constants/repository-visibility.js'
import { repositoryNameValidation } from '~/src/api/helpers/schema/common-validations.js'

const repositoryValidation = Joi.object({
  repositoryName: repositoryNameValidation,
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
