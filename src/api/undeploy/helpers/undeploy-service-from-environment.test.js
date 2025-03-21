import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { lookupServiceInEnvironment } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { getRepositoryInfo } from '~/src/helpers/portal-backend/get-repository-info.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'

jest.mock('~/src/helpers/feature-toggle/is-feature-enabled')
jest.mock('~/src/api/undeploy/helpers/register-undeployment')
jest.mock('~/src/api/undeploy/helpers/scale-ecs-to-zero')
jest.mock('~/src/helpers/portal-backend/lookup-tenant-service')
jest.mock('~/src/helpers/portal-backend/get-repository-info')

const logger = { info: jest.fn(), warn: jest.fn() }
registerUndeployment.mockResolvedValue()
scaleEcsToZero.mockResolvedValue()
lookupServiceInEnvironment.mockResolvedValue({
  serviceJson: { zone: 'some-zone' }
})
getRepositoryInfo.mockResolvedValue({ repository: { topics: [] } })

const serviceName = 'some-service'
const environment = 'dev'
const user = { id: 'some-user-id', displayName: 'some-name' }

async function callUndeployServiceFromEnvironment() {
  return await undeployServiceFromEnvironment(
    serviceName,
    environment,
    user,
    logger
  )
}

describe('#undeployServiceFromEnvironment', () => {
  test('should register undeployment', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await callUndeployServiceFromEnvironment()

    expect(registerUndeployment).toHaveBeenCalledTimes(1)
  })

  test('if not enabled should not call scaleEcsToZero', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await callUndeployServiceFromEnvironment()

    expect(isFeatureEnabled).toHaveBeenLastCalledWith(
      featureToggles.scaleEcsToZero
    )
    expect(scaleEcsToZero).toHaveBeenCalledTimes(0)
  })

  test('if enabled should call scaleEcsToZero', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await callUndeployServiceFromEnvironment()

    expect(isFeatureEnabled).toHaveBeenCalledWith(featureToggles.scaleEcsToZero)
    expect(lookupServiceInEnvironment).toHaveBeenCalledTimes(1)
    expect(scaleEcsToZero).toHaveBeenCalledTimes(1)
    expect(scaleEcsToZero).toHaveBeenCalledWith(
      serviceName,
      environment,
      'some-zone',
      user,
      expect.anything(),
      logger
    )
  })

  test('if test suite should not call anything', async () => {
    getRepositoryInfo.mockResolvedValue({
      repository: { topics: ['test-suite'] }
    })

    await callUndeployServiceFromEnvironment()

    expect(getRepositoryInfo).toHaveBeenCalledTimes(1)
    expect(lookupServiceInEnvironment).toHaveBeenCalledTimes(0)
    expect(registerUndeployment).toHaveBeenCalledTimes(0)
    expect(scaleEcsToZero).toHaveBeenCalledTimes(0)
  })
})
