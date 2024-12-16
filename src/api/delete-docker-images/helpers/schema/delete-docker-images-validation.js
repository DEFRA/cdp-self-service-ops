import Joi from 'joi'

function deleteDockerImagesValidation() {
  return Joi.object({
    imageName: Joi.string().min(1).required()
  })
}

export { deleteDockerImagesValidation }
