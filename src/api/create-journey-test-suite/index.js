import { createJourneyTestSuiteController } from './controller.js'

const createJourneyTestSuite = {
  plugin: {
    name: 'create-journey-test-suite',
    register: (server) => {
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
