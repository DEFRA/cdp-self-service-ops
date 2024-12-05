import Joi from 'joi'

import { environments } from '~/src/config/index.js'

export const deployTerminalValidation = () => {
  return Joi.object({
    service: Joi.string().required(),
    environment: Joi.string()
      .valid(...Object.values(environments))
      .required()
  })
}
