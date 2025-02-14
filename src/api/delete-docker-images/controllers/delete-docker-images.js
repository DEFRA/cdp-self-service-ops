import Joi from 'joi'

import { deleteDockerImages } from '~/src/api/decommission-service/helpers/delete-docker-images.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'

const deleteDockerImagesController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: Joi.object({
        imageName: Joi.string().min(1).required()
      })
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { imageName } = request.params
    const user = await getScopedUser(imageName, request.auth)

    await deleteDockerImages(imageName, user, request.logger)

    return h.response({ message: 'success' }).code(204)
  }
}

export { deleteDockerImagesController }
