import { health } from '~/src/api/health'
import { deploy } from '~/src/api/deploy'
import { status } from '~/src/api/status'
import { createMicroservice } from '~/src/api/create-microservice'
import { createRepository } from '~/src/api/create-repository'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        createMicroservice,
        createRepository,
        deploy,
        status
      ])
    }
  }
}

export { router }
