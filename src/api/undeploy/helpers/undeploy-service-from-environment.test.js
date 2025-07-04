import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { getEntity } from '~/src/helpers/portal-backend/get-entity.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'

jest.mock('~/src/helpers/portal-backend/get-entity')
jest.mock('~/src/helpers/feature-toggle/is-feature-enabled')
jest.mock('~/src/api/undeploy/helpers/scale-ecs-to-zero')
jest.mock('~/src/helpers/portal-backend/lookup-tenant-service.js')

const logger = { info: jest.fn(), warn: jest.fn() }
getEntity.mockResolvedValue({
  name: 'some-service',
  type: 'Microservice',
  subType: 'Frontend'
})
scaleEcsToZero.mockResolvedValue()
lookupTenantService.mockResolvedValue({
  serviceCode: 'CDP',
  zone: 'public',
  postgres: false
})

const repositoryName = 'some-service'
const environment = 'dev'
const user = { id: 'some-user-id', displayName: 'some-name' }

async function callUndeployServiceFromEnvironment() {
  return await undeployServiceFromEnvironment(
    repositoryName,
    environment,
    user,
    logger
  )
}

describe('#undeployServiceFromEnvironment', () => {
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
    expect(scaleEcsToZero).toHaveBeenCalledTimes(1)
    expect(scaleEcsToZero).toHaveBeenCalledWith(
      repositoryName,
      environment,
      'public',
      user,
      expect.anything(),
      logger
    )
  })

  test('if test suite should not call anything', async () => {
    getEntity.mockResolvedValue({ name: 'some-service', type: 'TestSuite' })

    await callUndeployServiceFromEnvironment()

    expect(getEntity).toHaveBeenCalledTimes(1)
    expect(scaleEcsToZero).toHaveBeenCalledTimes(0)
  })
})
