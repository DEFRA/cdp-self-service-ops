import { getUnfinished } from '~/src/api/status/helpers/get-unfinished'

const unfinishedController = {
  options: {},
  handler: async (request, h) => {
    const unfinished = await getUnfinished(request.db)

    return h.response({ message: 'success', unfinished })
  }
}

export { unfinishedController }
