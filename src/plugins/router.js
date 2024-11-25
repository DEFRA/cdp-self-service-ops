import { health } from '~/src/api/health/index.js'
import { deploy } from '~/src/api/deploy/index.js'
import { status } from '~/src/api/status/index.js'
import { createMicroservice } from '~/src/api/create-microservice/index.js'
import { createRepository } from '~/src/api/create-repository/index.js'
import { createEnvTestSuite } from '~/src/api/create-env-test-suite/index.js'
import { deployTestSuite } from '~/src/api/deploy-test-suite/index.js'
import { createPerfTestSuite } from '~/src/api/create-perf-test-suite/index.js'
import { queuedEvents } from '~/src/api/queued-events/index.js'
import { secrets } from '~/src/api/secrets/index.js'
import { deployWebShell } from '~/src/api/deploy-webshell/index.js'

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
