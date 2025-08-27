import { config } from '../../../config/index.js'
import { resetEvent } from '../../../helpers/queued-events/queued-events.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const resetEventController = {
  handler: async (request, h) => {
    const repositoryName = request.params.repositoryName
    const eventType = request.params.event

    const events = await resetEvent(request.db, repositoryName, eventType)
    await request.server.events.emit(config.get('serviceInfraCreateEvent'))

    return h.response(events).code(statusCodes.ok)
  }
}

export { resetEventController }
