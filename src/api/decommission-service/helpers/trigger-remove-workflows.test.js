import { triggerRemoveWorkflows } from './trigger-remove-workflows.js'
import {
  removeAppConfig,
  removeDashboard,
  removeNginxUpstreams,
  removeSquidConfig,
  removeTenantInfrastructure
} from '~/src/helpers/remove/workflows/index.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'

jest.mock('~/src/helpers/remove/workflows')
jest.mock('~/src/helpers/feature-toggle/is-feature-enabled')

const logger = {
  info: jest.fn()
}

describe('#triggerRemoveWorkflows', () => {
  const serviceName = 'some-service'
  const backendRepository = {
    topics: ['backend']
  }
  const testRepository = {
    topics: ['test-suite']
  }

  isFeatureEnabled.mockReturnValue(true)

  test('Should trigger remove app config workflow', async () => {
    await triggerRemoveWorkflows(serviceName, backendRepository, logger)

    expect(removeAppConfig).toHaveBeenCalledWith(serviceName, logger)
  })

  test('Should trigger remove squid config workflow', async () => {
    await triggerRemoveWorkflows(serviceName, backendRepository, logger)

    expect(removeSquidConfig).toHaveBeenCalledWith(serviceName, logger)
  })

  test('Should trigger remove tenant infrastructure workflow', async () => {
    await triggerRemoveWorkflows(serviceName, backendRepository, logger)

    expect(removeTenantInfrastructure).toHaveBeenCalledWith(serviceName, logger)
  })

  test('Should trigger remove dashboard workflow if not test suite', async () => {
    await triggerRemoveWorkflows(serviceName, backendRepository, logger)

    expect(removeDashboard).toHaveBeenCalledWith(serviceName, logger)
  })

  test('Should not trigger remove dashboard workflow if test suite', async () => {
    await triggerRemoveWorkflows(serviceName, testRepository, logger)

    expect(removeDashboard).toHaveBeenCalledTimes(0)
  })

  test('Should trigger remove nginx upstreams workflow if not test suite', async () => {
    await triggerRemoveWorkflows(serviceName, backendRepository, logger)

    expect(removeNginxUpstreams).toHaveBeenCalledWith(
      serviceName,
      'Protected',
      logger
    )
  })

  test('Should not trigger remove nginx upstreams workflow if test suite', async () => {
    await triggerRemoveWorkflows(serviceName, testRepository, logger)

    expect(removeNginxUpstreams).toHaveBeenCalledTimes(0)
  })

  test('Should log if remove service workflows feature is disabled', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await triggerRemoveWorkflows(serviceName, backendRepository, logger)

    expect(removeTenantInfrastructure).toHaveBeenCalledTimes(0)
    expect(logger.info).toHaveBeenCalledWith(
      'Remove service workflows feature is disabled'
    )
  })
})
