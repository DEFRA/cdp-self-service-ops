import Joi from 'joi'

function deployServicePayloadSchema() {

  const clusters = ['frontend', 'backend']
  return Joi.object({
    image: Joi.string().min(1).required(),
    version: Joi.string().pattern(/^v?\d+\.\d+\.\d+$/).required(),
    cluster: Joi.string().valid(...clusters).required()
  })

}

export {deployServicePayloadSchema}