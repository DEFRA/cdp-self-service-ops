import { statuses } from '~/src/constants/statuses.js'
import { getStatus } from '~/src/api/status/helpers/get-status.js'

const inProgressController = {
  options: {},
  handler: async (request, h) => {
    const repositoriesStatus = await getStatus(request.db, [
      statuses.inProgress,
      statuses.failure
    ])

    return h.response({ message: 'success', inProgress: repositoriesStatus })
  }
}

export { inProgressController }
