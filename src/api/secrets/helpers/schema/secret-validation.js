import Joi from 'joi'
import { omit } from 'lodash'

import { config, environments } from '~/src/config'

function secretParamsValidation() {
  return (params, options) => {
    const teamId = options.context.payload.teamId

    const validationResult = Joi.object({
      serviceName: Joi.string().min(1).required(),
      environment: Joi.string()
        .valid(...getEnvironments(teamId))
        .required()
    }).validate(params, options)

    if (validationResult?.error) {
      throw validationResult.error
    }

    return validationResult.value
  }
}

function getEnvironments(teamId) {
  const adminTeamId = config.get('oidcAdminGroupId')
  return teamId === adminTeamId
    ? Object.values(environments)
    : Object.values(omit(environments, ['management', 'infraDev']))
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
