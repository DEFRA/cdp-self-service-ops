import Joi from 'joi'
import { omit } from 'lodash'

import { config, environments } from '~/src/config'

function secretParamsValidation() {
  return (params, options) => {
    const adminTeamId = config.get('oidcAdminGroupId')
    const teamId = options.context.payload.teamId
    let schema

    if (teamId === adminTeamId) {
      schema = Joi.object({
        serviceName: Joi.string().min(1).required(),
        environment: Joi.string()
          .valid(...Object.values(environments))
          .required()
      })
    }

    if (teamId !== adminTeamId) {
      schema = Joi.object({
        serviceName: Joi.string().min(1).required(),
        environment: Joi.string()
          .valid(
            ...Object.values(omit(environments, ['management', 'infraDev']))
          )
          .required()
      })
    }

    const validationResult = schema.validate(params, options)

    if (validationResult?.error) {
      throw validationResult.error
    }

    return validationResult.value
  }
}

const platformGlobalSecretKeys = config.get('platformGlobalSecretKeys')

const secretPayloadValidation = Joi.object({
  secretKey: Joi.string()
    .not(...platformGlobalSecretKeys)
    .pattern(/^\w*$/)
    .pattern(/^[a-zA-Z0-9]\w*[a-zA-Z0-9]$/, {
      name: 'startAndEndWithCharacter'
    })
    .min(1)
    .max(512)
    .required(),
  secretValue: Joi.string().pattern(/^\S*$/).min(1).max(512).required(),
  teamId: Joi.string().uuid().required()
})

export { secretParamsValidation, secretPayloadValidation }
