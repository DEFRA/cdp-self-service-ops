import Joi from 'joi'

function deployServicePayloadSchema() {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    version: Joi.string()
      .pattern(/^v?\d+\.\d+\.\d+$/)
      .required()
  })
}

export { deployServicePayloadSchema }
