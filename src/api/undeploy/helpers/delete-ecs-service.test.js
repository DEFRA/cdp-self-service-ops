import {
  deleteEcsService,
  deleteAllEcsServices
} from '~/src/api/undeploy/helpers/delete-ecs-service.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsService } from '~/src/helpers/remove/workflows/remove-ecs-service.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'

jest.mock('~/src/helpers/portal-backend/lookup-tenant-service')
jest.mock('~/src/helpers/feature-toggle/is-feature-enabled')
jest.mock('~/src/helpers/remove/workflows/remove-ecs-service')

const serviceName = 'some-service'
const environment = 'some-environment'
const zone = 'some-zone'
const logger = { info: jest.fn(), warn: jest.fn() }
const service = { serviceName, zone }
const environments = ['dev', 'test']

describe('#deleteEcsService', () => {
  test('should remove ECS service if feature enabled', async () => {
    isFeatureEnabled.mockReturnValue(true)
    lookupTenantService.mockResolvedValue(service)

    await deleteEcsService({ serviceName, environment, logger })

    expect(isFeatureEnabled).toHaveBeenCalledWith(
      featureToggles.undeploy.deleteEcsService
    )
    expect(lookupTenantService).toHaveBeenCalledTimes(1)
    expect(removeEcsService).toHaveBeenCalledWith(
      serviceName,
      environment,
      zone,
      logger
    )
  })

  test('should not remove ECS service if feature disabled', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await deleteEcsService({ serviceName, environment, logger })

    expect(lookupTenantService).toHaveBeenCalledTimes(0)
    expect(removeEcsService).toHaveBeenCalledTimes(0)
  })

  test('should not remove ECS service if service not in environment', async () => {
    isFeatureEnabled.mockReturnValue(true)
    lookupTenantService.mockResolvedValue({ message: 'Not found' })

    await deleteEcsService({ serviceName, environment, logger })

    expect(lookupTenantService).toHaveBeenCalledTimes(1)
    expect(removeEcsService).toHaveBeenCalledTimes(0)
  })
})

describe('#deleteAllEcsServices', () => {
  test('should call deleteEcsService for each environment', async () => {
    isFeatureEnabled.mockReturnValue(true)
    lookupTenantService.mockResolvedValue(service)

    await deleteAllEcsServices({ serviceName, environments, logger })

    expect(lookupTenantService).toHaveBeenCalledTimes(2)
    expect(removeEcsService).toHaveBeenCalledTimes(2)
    expect(removeEcsService).toHaveBeenCalledWith(
      serviceName,
      'dev',
      zone,
      logger
    )
    expect(removeEcsService).toHaveBeenCalledWith(
      serviceName,
      'test',
      zone,
      logger
    )
  })
})
