import Joi from 'joi'
import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { getRepositoryUnfinished } from '~/src/api/status/helpers/get-repository-unfinished'

const unfinishedRepositoryController = {
  options: {
    validate: {
      params: Joi.object({
        repositoryName: Joi.string()
      })
    }
  },
  handler: async (request, h) => {
    const repositoryName = request.params.repositoryName
    const unfinishedRepository = await getRepositoryUnfinished(
      request.db,
      repositoryName
    )

    if (isNull(unfinishedRepository)) {
      return Boom.notFound()
    }

    return h.response({ message: 'success', unfinished: unfinishedRepository })
  }
}

export { unfinishedRepositoryController }
