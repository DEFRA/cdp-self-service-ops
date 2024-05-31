import { health } from '~/src/api/health'
import { deploy } from '~/src/api/deploy'
import { status } from '~/src/api/status'
import { createMicroservice } from '~/src/api/create-microservice'
import { createRepository } from '~/src/api/create-repository'
import { createTestSuite } from '~/src/api/create-test-suite'
import { createEnvTestSuite } from '~/src/api/create-env-test-suite'
import { deployTestSuite } from '~/src/api/deploy-test-suite'
import { createPerfTestSuite } from '~/src/api/create-perf-test-suite'
import { createSmokeTestSuite } from '~/src/api/create-smoke-test-suite'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        createMicroservice,
        createRepository,
        createTestSuite,
        createEnvTestSuite,
        createPerfTestSuite,
        createSmokeTestSuite,
        deploy,
        deployTestSuite,
        status
      ])
    }
  }
}

export { router }
