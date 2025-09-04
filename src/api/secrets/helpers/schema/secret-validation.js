import Joi from 'joi'
import { config } from '../../../../config/index.js'
import {
  environmentValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'
/**
 * Validates the params for secrets.
 * @returns {Function} A function that validates the given parameters and options.
 */
const secretParamsValidation = () =>
  Joi.object({
    serviceName: repositoryNameValidation,
    environment: environmentValidation
  })

/**
 * Validates the payload for secrets.
 * @returns {object} Joi validation schema for the secret payload.
 */
const secretPayloadValidation = () =>
  Joi.object({
    secretKey: Joi.string()
      .not(...config.get('platformGlobalSecretKeys'))
      .pattern(/^\w*$/)
      .pattern(/^[a-zA-Z0-9]\w*[a-zA-Z0-9]$/, {
        name: 'startAndEndWithCharacter'
      })
      .min(1)
      .max(20000)
      .required(),
    secretValue: Joi.string().pattern(/^\S*$/).min(1).max(20000).required()
  }).unknown(true)

export { secretParamsValidation, secretPayloadValidation }
