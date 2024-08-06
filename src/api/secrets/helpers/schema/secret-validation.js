import Joi from 'joi'
import { omit } from 'lodash'

import { config, environments } from '~/src/config'

function secretParamsValidation() {
  return (params, options) => {
    const adminTeamId = config.get('oidcAdminGroupId')
    const teamId = options.context.payload.teamId
    const allowedEnvironments =
      teamId === adminTeamId
        ? Object.values(environments)
        : Object.values(omit(environments, ['management', 'infraDev']))

    const validationResult = Joi.object({
      serviceName: Joi.string().min(1).required(),
      environment: Joi.string()
        .valid(...allowedEnvironments)
        .required()
    }).validate(params, options)

    if (validationResult?.error) {
      throw validationResult.error
    }

    return validationResult.value
  }
}

const secretPayloadValidation = Joi.object({
  secretKey: Joi.string()
    .not(...config.get('platformGlobalSecretKeys'))
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
