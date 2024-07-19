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

const globalSecrets = config.get('secrets').global

const secretPayloadValidation = Joi.object({
  secretKey: Joi.string()
    .not(...globalSecrets)
    .required(),
  secretValue: Joi.string().required(),
  teamId: Joi.string().uuid().required()
})

export { secretParamsValidation, secretPayloadValidation }
