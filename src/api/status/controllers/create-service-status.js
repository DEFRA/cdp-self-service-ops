import Joi from 'joi'
import Boom from '@hapi/boom'

import { getRepositoryStatus } from '~/src/api/status/helpers/get-repository-status'

const createServiceStatusController = {
  options: {
    validate: {
      params: Joi.object({
        repositoryName: Joi.string()
      })
    }
  },
  handler: async (request, h) => {
    const repositoryName = request.params.repositoryName
    const repositoryStatus = await getRepositoryStatus(
      request.db,
      repositoryName
    )

    if (!repositoryStatus) {
      return Boom.notFound(`Service ${repositoryName} not found`)
    }

    return h.response({ message: 'success', status: repositoryStatus })
  }
}

export { createServiceStatusController }
