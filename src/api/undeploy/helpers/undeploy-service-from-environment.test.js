import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { removeDeploymentFile } from '~/src/api/undeploy/helpers/remove-deployment-file.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { undeployServiceFromEnvironmentWithId } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'

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
jest.mock('~/src/api/undeploy/helpers/remove-deployment-file', () => {
  return {
    removeDeploymentFile: jest.fn()
  }
})
jest.mock('~/src/api/deploy/helpers/lookup-tenant-service', () => {
  return {
    lookupTenantService: jest.fn()
  }
})

registerUndeployment.mockResolvedValue()
removeDeploymentFile.mockResolvedValue()
lookupTenantService.mockResolvedValue({ zone: 'some-zone' })

const undeploymentId = crypto.randomUUID()
const imageName = 'some-service'
const environment = 'some-environment'
const user = { id: 'some-user-id', displayName: 'some-name' }

async function callUndeployServiceFromEnvironment() {
  return await undeployServiceFromEnvironmentWithId(
    undeploymentId,
    imageName,
    environment,
    user
  )
}

describe('#undeployServiceFromEnvironment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  test('if not enabled should not call removeDeploymentFile', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await callUndeployServiceFromEnvironment()

    expect(removeDeploymentFile).toHaveBeenCalledTimes(0)
  })

  test('if enabled should call removeDeploymentFile', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await callUndeployServiceFromEnvironment()

    expect(removeDeploymentFile).toHaveBeenCalledTimes(1)
    expect(removeDeploymentFile).toHaveBeenCalledWith(
      undeploymentId,
      imageName,
      environment,
      'some-zone',
      user
    )
  })
})
