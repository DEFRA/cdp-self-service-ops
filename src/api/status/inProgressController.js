import { findByStatus } from '~/src/api/status/helpers/status-lookup'

const inProgressController = {
  options: {},
  handler: async (request, h) => {
    const statuses = await findByStatus(request.db, ['in-progress', 'failure'])
    return h.response(statuses).code(200)
  }
}

export { inProgressController }
