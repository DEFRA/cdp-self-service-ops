import {
  deleteEcsService,
  deleteAllEcsServices
} from '~/src/api/undeploy/helpers/delete-ecs-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsService } from '~/src/helpers/remove/workflows/remove-ecs-service.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { orderedEnvironments } from '~/src/config/environments.js'

jest.mock('~/src/helpers/feature-toggle/is-feature-enabled')
jest.mock('~/src/helpers/remove/workflows/remove-ecs-service')

const serviceName = 'some-service'
const environment = 'some-environment'
const logger = { info: jest.fn(), warn: jest.fn() }

describe('#deleteEcsService', () => {
  test('should remove ECS service if feature enabled', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await deleteEcsService(serviceName, environment, logger)

    expect(isFeatureEnabled).toHaveBeenCalledWith(
      featureToggles.undeploy.deleteEcsService
    )
    expect(removeEcsService).toHaveBeenCalledWith(
      serviceName,
      environment,
      logger
    )
  })

  test('should not remove ECS service if decommission is enabled but feature is disabled', async () => {
    isFeatureEnabled.mockReturnValueOnce(true).mockReturnValue(false)

    await deleteEcsService(serviceName, environment, logger)

    expect(isFeatureEnabled).toHaveBeenCalledTimes(2)
    expect(isFeatureEnabled).toHaveBeenNthCalledWith(
      1,
      featureToggles.decommissionService
    )
    expect(isFeatureEnabled).toHaveBeenLastCalledWith(
      featureToggles.undeploy.deleteEcsService
    )
    expect(removeEcsService).toHaveBeenCalledTimes(0)
  })

  test('should not remove ECS service if decommission feature is disabled', async () => {
    isFeatureEnabled.mockReturnValueOnce(false).mockReturnValue(true)

    await deleteEcsService(serviceName, environment, logger)

    expect(isFeatureEnabled).toHaveBeenCalledTimes(1)
    expect(isFeatureEnabled).toHaveBeenLastCalledWith(
      featureToggles.decommissionService
    )
    expect(removeEcsService).toHaveBeenCalledTimes(0)
  })

  test('should not remove ECS service if both features are disabled', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await deleteEcsService(serviceName, environment, logger)

    expect(removeEcsService).toHaveBeenCalledTimes(0)
  })
})

describe('#deleteAllEcsServices', () => {
  test('should call deleteEcsService for each environment', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await deleteAllEcsServices(serviceName, logger)

    expect(removeEcsService).toHaveBeenCalledTimes(7)
    orderedEnvironments.forEach((env) => {
      expect(removeEcsService).toHaveBeenCalledWith(serviceName, env, logger)
    })
  })
})
