import Joi from 'joi'

import { environments } from '~/src/config/environments.js'

function undeployServiceValidation() {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    environment: Joi.string()
      .valid(...Object.values(environments))
      .required()
  })
}

export { undeployServiceValidation }
