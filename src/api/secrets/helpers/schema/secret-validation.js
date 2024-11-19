import Joi from 'joi'

import { config, environments } from '~/src/config/index.js'

/**
 * Validates the params for secrets.
 * @returns {Function} A function that validates the given parameters and options.
 */
const secretParamsValidation = () =>
  Joi.object({
    serviceName: Joi.string().min(1).required(),
    environment: Joi.string()
      .valid(...Object.values(environments))
      .required()
  })

/**
 * Validates the payload for secrets.
 * @returns {Object} Joi validation schema for the secret payload.
 * */
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
