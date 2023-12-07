import { statuses } from '~/src/constants/statuses'
import { findRepositoriesByStatus } from '~/src/helpers/db/status/find-repositories-by-status'

const inProgressController = {
  options: {},
  handler: async (request, h) => {
    const repositoriesStatus = await findRepositoriesByStatus(request.db, [
      statuses.inProgress,
      statuses.failure
    ])

    return h.response({ message: 'success', statuses: repositoriesStatus })
  }
}

export { inProgressController }
