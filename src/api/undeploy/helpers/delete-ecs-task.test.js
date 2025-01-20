import {
  deleteEcsTask,
  deleteAllEcsTask
} from '~/src/api/undeploy/helpers/delete-ecs-task.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsTask } from '~/src/helpers/remove/workflows/remove-ecs-task.js'

jest.mock('~/src/api/deploy/helpers/lookup-tenant-service')
jest.mock('~/src/helpers/feature-toggle/is-feature-enabled')
jest.mock('~/src/helpers/remove/workflows/remove-ecs-task')

const serviceName = 'some-service'
const environment = 'some-environment'
const logger = { info: jest.fn(), warn: jest.fn() }
const service = { serviceName, zone: 'some-zone' }
const environments = ['dev', 'test']

describe('#deleteEcsTask', () => {
  test('should remove ECS task if feature enabled', async () => {
    isFeatureEnabled.mockReturnValue(true)
    lookupTenantService.mockResolvedValue(service)

    await deleteEcsTask({ serviceName, environment, logger })

    expect(lookupTenantService).toHaveBeenCalledTimes(1)
    expect(removeEcsTask).toHaveBeenCalledWith(serviceName, environment, logger)
  })

  test('should not remove ECS task if feature disabled', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await deleteEcsTask({ serviceName, environment, logger })

    expect(lookupTenantService).toHaveBeenCalledTimes(0)
    expect(removeEcsTask).toHaveBeenCalledTimes(0)
  })

  test('should not remove ECS task if service not in environment', async () => {
    isFeatureEnabled.mockReturnValue(true)
    lookupTenantService.mockResolvedValue({ message: 'Not found' })

    await deleteEcsTask({ serviceName, environment, logger })

    expect(lookupTenantService).toHaveBeenCalledTimes(1)
    expect(removeEcsTask).toHaveBeenCalledTimes(0)
  })
})

describe('#deleteAllEcsTasks', () => {
  test('should call deleteEcsTask for each environment', async () => {
    isFeatureEnabled.mockReturnValue(true)
    lookupTenantService.mockResolvedValue(service)

    await deleteAllEcsTask({ serviceName, environments, logger })

    expect(lookupTenantService).toHaveBeenCalledTimes(2)
    expect(removeEcsTask).toHaveBeenCalledTimes(2)
    expect(removeEcsTask).toHaveBeenCalledWith(serviceName, 'dev', logger)
    expect(removeEcsTask).toHaveBeenCalledWith(serviceName, 'test', logger)
  })
})
