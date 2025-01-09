import Joi from 'joi'

import { statuses } from '~/src/constants/statuses.js'
import { getStatus } from '~/src/api/status/helpers/get-status.js'

const inProgressController = {
  options: {
    validate: {
      query: Joi.object({
        service: Joi.string().allow(''),
        teamId: Joi.string().allow(''),
        kind: Joi.string().allow('')
      })
    }
  },
  handler: async (request, h) => {
    const repositoriesStatus = await getStatus(
      request.db,
      [statuses.inProgress, statuses.failure],
      request.query
    )

    return h.response({ message: 'success', inProgress: repositoriesStatus })
  }
}

export { inProgressController }
