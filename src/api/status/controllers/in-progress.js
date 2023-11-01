import { getRepositoriesStatuses } from '~/src/api/status/helpers/get-repositories-statuses'

const inProgressController = {
  options: {},
  handler: async (request, h) => {
    const repositoriesStatus = await getRepositoriesStatuses(request.db, [
      'in-progress',
      'failure'
    ])

    return h.response({ message: 'success', statuses: repositoriesStatus })
  }
}

export { inProgressController }
