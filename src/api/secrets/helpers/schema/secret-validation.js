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

function secretKeyValidation() {
  return Joi.string()
    .disallow(...config.get('platformGlobalSecretKeys'))
    .pattern(/^\w*$/)
    .pattern(/^[a-zA-Z0-9]\w*[a-zA-Z0-9]$/, {
      name: 'startAndEndWithCharacter'
    })
    .min(1)
    .max(20000)
    .required()
}

/**
 * Validates the payload for adding secrets.
 * @returns {object} Joi validation schema for the secret payload.
 */
const addSecretPayloadValidation = () =>
  Joi.object({
    secretKey: secretKeyValidation(),
    secretValue: Joi.string().pattern(/^\S*$/).min(1).max(20000).required()
  }).unknown(true)

/**
 * Validates the payload for removing secrets.
 * @returns {object} Joi validation schema for the secret payload.
 */
const removeSecretPayloadValidation = () =>
  Joi.object({
    secretKey: secretKeyValidation()
  }).unknown(true)

export {
  secretParamsValidation,
  addSecretPayloadValidation,
  removeSecretPayloadValidation
}
