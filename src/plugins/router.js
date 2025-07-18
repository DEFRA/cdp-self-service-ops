import { createJourneyTestSuite } from '~/src/api/create-journey-test-suite/index.js'
import { createMicroservice } from '~/src/api/create-microservice/index.js'
import { createPerfTestSuite } from '~/src/api/create-perf-test-suite/index.js'
import { createRepository } from '~/src/api/create-repository/index.js'
import { deploy } from '~/src/api/deploy/index.js'
import { deployTestSuite } from '~/src/api/deploy-test-suite/index.js'
import { deployTerminal } from '~/src/api/deploy-terminal/index.js'
import { health } from '~/src/api/health/index.js'
import { queuedEvents } from '~/src/api/queued-events/index.js'
import { secrets } from '~/src/api/secrets/index.js'
import { decommissionService } from '~/src/api/decommission-service/index.js'
import { databaseMigrations } from '~/src/api/deploy-database-migration/index.js'
import { shutter } from '~/src/api/shutter/index.js'

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
        decommissionService,
        deploy,
        deployTestSuite,
        deployTerminal,
        databaseMigrations,
        queuedEvents,
        secrets,
        shutter
      ])
    }
  }
}

export { router }
