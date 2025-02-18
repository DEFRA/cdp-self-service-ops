import Joi from 'joi'
import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { statuses } from '~/src/constants/statuses.js'
import { getRepositoryStatus } from '~/src/api/status/helpers/get-repository-status.js'
import { repositoryNameValidation } from '~/src/api/helpers/schema/common-validations.js'

const repositoryStatusController = {
  options: {
    validate: {
      params: Joi.object({
        repositoryName: repositoryNameValidation
      })
    }
  },
  handler: async (request, h) => {
    const repositoryName = request.params.repositoryName
    const repositoryStatus = await getRepositoryStatus(
      request.db,
      repositoryName,
      [statuses.inProgress, statuses.success, statuses.failure]
    )

    if (isNull(repositoryStatus)) {
      return Boom.notFound()
    }

    return h.response({ message: 'success', repositoryStatus })
  }
}

export { repositoryStatusController }
