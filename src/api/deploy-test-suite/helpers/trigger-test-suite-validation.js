import Joi from 'joi'
import { environments } from '~/src/config'

const triggerTestSuiteValidation = () => {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    environment: Joi.string()
      .valid(...Object.values(environments))
      .required(),
    user: Joi.object({
      id: Joi.string().required(),
      displayName: Joi.string().required()
    })
  })
}

export { triggerTestSuiteValidation }
