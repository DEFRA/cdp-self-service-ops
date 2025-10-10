import { environments } from '@defra/cdp-validation-kit'

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
