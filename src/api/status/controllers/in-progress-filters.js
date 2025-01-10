import Joi from 'joi'

import { statuses } from '~/src/constants/statuses.js'
import { getStatusFilters } from '~/src/api/status/helpers/get-status-filters.js'

const inProgressFiltersController = {
  options: {
    validate: {
      query: Joi.object({
        kind: Joi.string().allow('')
      })
    }
  },
  handler: async (request, h) => {
    const filterResult = await getStatusFilters(
      request.db,
      [statuses.inProgress, statuses.failure],
      request.query
    )

    const filters = {
      services: filterResult?.services ?? [],
      teams: filterResult?.teams ?? []
    }

    return h.response({ message: 'success', filters })
  }
}

export { inProgressFiltersController }
