import { getEventsController } from '~/src/api/queued-events/controller/get-events'
import { resetEventController } from '~/src/api/queued-events/controller/reset-event'
import { withTracing } from '~/src/helpers/tracing/tracing'

const queuedEvents = {
  plugin: {
    name: 'queued-events',
    register: async (server) => {
      server.route(
        [
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
        ].map(withTracing)
      )
    }
  }
}

export { queuedEvents }
