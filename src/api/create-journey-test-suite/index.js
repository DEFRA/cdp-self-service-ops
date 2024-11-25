import { createJourneyTestSuiteController } from '~/src/api/create-journey-test-suite/controller'

const createJourneyTestSuite = {
  plugin: {
    name: 'create-journey-test-suite',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/create-journey-test-suite',
          ...createJourneyTestSuiteController
        }
      ])
    }
  }
}

export { createJourneyTestSuite }
