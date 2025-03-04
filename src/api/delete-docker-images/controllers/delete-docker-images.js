import Joi from 'joi'

import { deleteDockerImages } from '~/src/api/decommission-service/helpers/delete-docker-images.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'
import { repositoryNameValidation } from '~/src/api/helpers/schema/common-validations.js'

const deleteDockerImagesController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: Joi.object({
        serviceName: repositoryNameValidation
      })
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { serviceName } = request.params
    const user = await getScopedUser(serviceName, request.auth)

    await deleteDockerImages(serviceName, user, request.logger)

    return h.response({ message: 'success' }).code(204)
  }
}

export { deleteDockerImagesController }
