import { findAll } from '../../../helpers/queued-events/queued-events.js'
import { statusCodes } from '../../../constants/status-codes.js'

const getEventsController = {
  handler: async (request, h) => {
    const repositoryName = request.query.repositoryName
    const eventType = request.query.eventType
    const includeProcessed =
      request.query?.includeProcessed?.toLowerCase() === 'true'

    const predicate = {
      ...(eventType && { eventType }),
      ...(repositoryName && { repositoryName }),
      ...(!includeProcessed && { status: { $ne: 'processed' } })
    }
    const events = await findAll(request.db, predicate)

    return h.response(events).code(statusCodes.ok)
  }
}

export { getEventsController }
