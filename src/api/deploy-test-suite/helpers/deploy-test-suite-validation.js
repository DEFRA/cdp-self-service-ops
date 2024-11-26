import Joi from 'joi'
import { environments } from '~/src/config/index.js'

const deployTestSuiteValidation = () => {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    environment: Joi.string()
      .valid(...Object.values(environments))
      .required()
  })
}

export { deployTestSuiteValidation }
