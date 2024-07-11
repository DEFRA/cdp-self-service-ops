import { getEventsController } from '~/src/api/queued-events/controller/get-events'
import { resetEventController } from '~/src/api/queued-events/controller/reset-event'

const queuedEvents = {
  plugin: {
    name: 'queued-events',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/queued-events',
          ...getEventsController
        },
        {
          method: 'PATCH',
          path: '/queued-events/{event}/{repositoryName}',
          ...resetEventController
        }
      ])
    }
  }
}

export { queuedEvents }
