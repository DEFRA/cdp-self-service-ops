import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'

jest.mock('~/src/helpers/feature-toggle/is-feature-enabled', () => {
  return {
    isFeatureEnabled: jest.fn()
  }
})
jest.mock('~/src/api/undeploy/helpers/register-undeployment', () => {
  return {
    registerUndeployment: jest.fn()
  }
})
jest.mock('~/src/api/undeploy/helpers/scale-ecs-to-zero', () => {
  return {
    scaleEcsToZero: jest.fn()
  }
})
jest.mock('~/src/api/deploy/helpers/lookup-tenant-service', () => {
  return {
    lookupTenantService: jest.fn()
  }
})
const mockLogger = { info: jest.fn() }
registerUndeployment.mockResolvedValue()
scaleEcsToZero.mockResolvedValue()
lookupTenantService.mockResolvedValue({ zone: 'some-zone' })

const undeploymentId = crypto.randomUUID()
const serviceName = 'some-service'
const environment = 'dev'
const user = { id: 'some-user-id', displayName: 'some-name' }
const deployFromFileEnvironments = ['dev']

async function callUndeployServiceFromEnvironment() {
  return await undeployServiceFromEnvironment({
    serviceName,
    environment,
    user,
    undeploymentId,
    deployFromFileEnvironments,
    logger: mockLogger
  })
}

describe('#undeployServiceFromEnvironment', () => {
  test('if not enabled should not call undeploy registration', async () => {
    isFeatureEnabled.mockReturnValueOnce(false).mockReturnValue(true)

    await callUndeployServiceFromEnvironment()

    expect(registerUndeployment).toHaveBeenCalledTimes(0)
  })

  test('if enabled should call undeploy registration', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await callUndeployServiceFromEnvironment()

    expect(registerUndeployment).toHaveBeenCalledTimes(1)
  })

  test('if not enabled should not call scaleEcsToZero', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await callUndeployServiceFromEnvironment()

    expect(scaleEcsToZero).toHaveBeenCalledTimes(0)
  })

  test('if enabled should call scaleEcsToZero', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await callUndeployServiceFromEnvironment()

    expect(scaleEcsToZero).toHaveBeenCalledTimes(1)
    expect(scaleEcsToZero).toHaveBeenCalledWith({
      serviceName,
      environment,
      zone: 'some-zone',
      user,
      undeploymentId,
      logger: mockLogger
    })
  })
})
