import { statusLookup } from '~/src/api/status/helpers/status-lookup'

const createServiceStatusController = {
  options: {},
  handler: async (request, h) => {
    // get repo name from path
    const repo = request.params.repo

    // look up in db
    const status = await statusLookup(request.db, repo)

    if (status) {
      return status
    } else {
      return h.response(`Service ${repo} not found`).code(404)
    }
  }
}

export { createServiceStatusController }
