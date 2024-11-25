import { health } from '~/src/api/health'
import { deploy } from '~/src/api/deploy'
import { status } from '~/src/api/status'
import { createMicroservice } from '~/src/api/create-microservice'
import { createRepository } from '~/src/api/create-repository'
import { createEnvTestSuite } from '~/src/api/create-env-test-suite'
import { deployTestSuite } from '~/src/api/deploy-test-suite'
import { createPerfTestSuite } from '~/src/api/create-perf-test-suite'
import { queuedEvents } from '~/src/api/queued-events'
import { secrets } from '~/src/api/secrets'
import { deployWebShell } from '~/src/api/deploy-webshell'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        createMicroservice,
        createRepository,
        createEnvTestSuite,
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
