import { resetEvent } from '~/src/helpers/queued-events/queued-events'
import { config } from '~/src/config'

const resetEventController = {
  handler: async (request, h) => {
    const repositoryName = request.params.repositoryName
    const eventType = request.params.event

    const events = await resetEvent(request.db, repositoryName, eventType)
    await request.server.events.emit(config.get('serviceInfraCreateEvent'))

    return h.response(events).code(200)
  }
}

export { resetEventController }
