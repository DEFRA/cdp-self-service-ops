import { environments } from '~/src/config/environments.js'

const testRunnerEnvironments = {
  smoke: [
    environments.prod,
    environments.perfTest,
    environments.test,
    environments.dev,
    environments.management,
    environments.infraDev
  ],
  performance: [
    environments.perfTest,
    environments.management,
    environments.infraDev
  ],
  environment: [
    environments.test,
    environments.dev,
    environments.management,
    environments.infraDev
  ]
}

export { testRunnerEnvironments }
