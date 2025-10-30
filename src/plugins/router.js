import { createRepository } from '../api/create-repository/index.js'
import { deploy } from '../api/deploy/index.js'
import { deployTestSuite } from '../api/deploy-test-suite/index.js'
import { deployTerminal } from '../api/deploy-terminal/index.js'
import { health } from '../api/health/index.js'
import { secrets } from '../api/secrets/index.js'
import { decommissionService } from '../api/decommission-service/index.js'
import { databaseMigrations } from '../api/deploy-database-migration/index.js'
import { shutter } from '../api/shutter/index.js'
import { createTenant } from '../api/create-tenant/index.js'
import { ephemeralKeys } from '../api/ephemeral-keys/index.js'
import { platformState } from '../api/platform-state/index.js'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        createRepository,
        createTenant,
        decommissionService,
        deploy,
        deployTestSuite,
        deployTerminal,
        databaseMigrations,
        ephemeralKeys,
        platformState,
        secrets,
        shutter
      ])
    }
  }
}

export { router }
