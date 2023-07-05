import Joi from 'joi'

import { environments } from '~/src/config'

function deployServicePayloadSchema() {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    version: Joi.string()
      .pattern(/^v?\d+\.\d+\.\d+$/)
      .required(),
    environment: Joi.string().valid(...Object.values(environments))
  })
}

export { deployServicePayloadSchema }
