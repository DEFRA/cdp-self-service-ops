import Joi from 'joi'

// TODO get these from the API layer
const environments = [
  'sandbox',
  'development',
  'test',
  'perfTest',
  'production'
]

function deployServicePayloadSchema() {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    version: Joi.string()
      .pattern(/^v?\d+\.\d+\.\d+$/)
      .required(),
    environment: Joi.string().valid(...environments)
  })
}

export { deployServicePayloadSchema }
