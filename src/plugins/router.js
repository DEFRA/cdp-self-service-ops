import { createJourneyTestSuite } from '~/src/api/create-journey-test-suite'
import { createMicroservice } from '~/src/api/create-microservice'
import { createPerfTestSuite } from '~/src/api/create-perf-test-suite'
import { createRepository } from '~/src/api/create-repository'
import { deploy } from '~/src/api/deploy'
import { deployTestSuite } from '~/src/api/deploy-test-suite'
import { deployWebShell } from '~/src/api/deploy-webshell'
import { health } from '~/src/api/health'
import { queuedEvents } from '~/src/api/queued-events'
import { secrets } from '~/src/api/secrets'
import { status } from '~/src/api/status'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        createMicroservice,
        createRepository,
        createJourneyTestSuite,
        createPerfTestSuite,
        deploy,
        deployTestSuite,
        deployWebShell,
        status,
        queuedEvents,
        secrets
      ])
    }
  }
}

export { router }
