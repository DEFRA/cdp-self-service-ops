import Joi from 'joi'

import { finishRepository } from '~/src/api/status/helpers/finish-repository'

const finishByRepositoryController = {
  options: {
    validate: {
      params: Joi.object({
        repositoryName: Joi.string()
      })
    }
  },
  handler: async (request, h) => {
    const repositoryName = request.params.repositoryName
    await finishRepository(request.db, repositoryName)

    return h.response({ message: 'success', repositoryName })
  }
}

export { finishByRepositoryController }
