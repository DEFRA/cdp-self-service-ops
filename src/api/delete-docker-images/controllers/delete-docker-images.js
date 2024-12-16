import Joi from 'joi'

import { deleteDockerImagesValidation } from '~/src/api/delete-docker-images/helpers/schema/delete-docker-images-validation.js'
import { deleteDockerhubImages } from '~/src/api/delete-docker-images/helpers/delete-dockerhub-images.js'
import { deleteEcrImages } from '~/src/api/delete-docker-images/helpers/delete-ecr-images.js'
import { getScopedUser } from '~/src/api/common/helpers/get-scoped-user.js'

const deleteDockerImagesController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: deleteDockerImagesValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { imageName } = request.params
    const user = await getScopedUser(imageName, request.auth, 'admin')

    await deleteEcrImages(imageName, user)

    await deleteDockerhubImages(imageName, user)

    return h.response({ message: 'success' }).code(204)
  }
}

export { deleteDockerImagesController }
