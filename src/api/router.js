import { health } from '~/src/api/health'
import { deploy } from '~/src/api/deploy'
import { status } from '~/src/api/status'
import { createMicroservice } from '~/src/api/create-microservice'
import { createRepository } from '~/src/api/create-repository'
import { createTestSuite } from '~/src/api/create-test-suite'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        createMicroservice,
        createRepository,
        createTestSuite,
        deploy,
        status
      ])
    }
  }
}

export { router }
