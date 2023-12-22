import { statuses } from '~/src/constants/statuses'
import { getStatus } from '~/src/api/status/helpers/get-status'

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
