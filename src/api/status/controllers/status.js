import Joi from 'joi'
import Boom from '@hapi/boom'

import { findStatusForRepository } from '~/src/helpers/db/status/find-status-for-repository'

const statusController = {
  options: {
    validate: {
      params: Joi.object({
        repositoryName: Joi.string()
      })
    }
  },
  handler: async (request, h) => {
    const repositoryName = request.params.repositoryName
    const repositoryStatus = await findStatusForRepository(
      request.db,
      repositoryName
    )

    if (!repositoryStatus) {
      return Boom.notFound(`Status for: ${repositoryName} not found`)
    }

    return h.response({ message: 'success', status: repositoryStatus })
  }
}

export { statusController }
