import Joi from 'joi'
import {
  repositoryNameValidation,
  teamIdValidation
} from '@defra/cdp-validation-kit'

import { repositoryVisibility } from '../../constants/repository-visibility.js'

const repositoryValidation = Joi.object({
  repositoryName: repositoryNameValidation,
  repositoryVisibility: Joi.string()
    .valid(...repositoryVisibility)
    .messages({
      'any.only': 'Choose repository visibility',
      'any.required': 'Choose repository visibility'
    })
    .required(),
  teamId: teamIdValidation
    .messages({
      'any.required': 'Choose owning team'
    })
    .required()
})

export { repositoryValidation }
