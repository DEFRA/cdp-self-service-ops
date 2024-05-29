import { environments } from '~/src/config/environments'

const testRunnerEnvironments = {
  smoke: environments,
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
