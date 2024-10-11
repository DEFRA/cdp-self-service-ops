import Joi from 'joi'
import { environments } from '~/src/config'

export const deployWebShellValidation = () => {
  return Joi.object({
    service: Joi.string().required(),
    environment: Joi.string()
      .valid(...Object.values(environments))
      .required()
  })
}
