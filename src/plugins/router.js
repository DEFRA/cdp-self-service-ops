import { createJourneyTestSuite } from '../api/create-journey-test-suite/index.js'
import { createMicroservice } from '../api/create-microservice/index.js'
import { createPerfTestSuite } from '../api/create-perf-test-suite/index.js'
import { createRepository } from '../api/create-repository/index.js'
import { deploy } from '../api/deploy/index.js'
import { deployTestSuite } from '../api/deploy-test-suite/index.js'
import { deployTerminal } from '../api/deploy-terminal/index.js'
import { health } from '../api/health/index.js'
import { secrets } from '../api/secrets/index.js'
import { decommissionService } from '../api/decommission-service/index.js'
import { databaseMigrations } from '../api/deploy-database-migration/index.js'
import { shutter } from '../api/shutter/index.js'
import { createPrototype } from '../api/create-prototype/index.js'
import { createTenant } from '../api/create-tenant/index.js'
import { ephemeralKeys } from '../api/ephemeral-keys/index.js'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        createMicroservice,
        createPrototype,
        createRepository,
        createJourneyTestSuite,
        createPerfTestSuite,
        createTenant,
        decommissionService,
        deploy,
        deployTestSuite,
        deployTerminal,
        databaseMigrations,
        ephemeralKeys,
        secrets,
        shutter
      ])
    }
  }
}

export { router }
