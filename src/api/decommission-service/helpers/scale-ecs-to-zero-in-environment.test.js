import { scaleEcsToZero } from '~/src/api/decommission-service/helpers/scale-ecs-to-zero.js'
import { scaleEcsToZeroInEnvironment } from '~/src/api/decommission-service/helpers/scale-ecs-to-zero-in-environment.js'
import { getEntity } from '~/src/helpers/portal-backend/get-entity.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'

jest.mock('~/src/helpers/portal-backend/get-entity.js')
jest.mock('~/src/api/decommission-service/helpers/scale-ecs-to-zero.js')
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

async function callScaleEcsToZeroInEnvironment() {
  return await scaleEcsToZeroInEnvironment(
    repositoryName,
    environment,
    user,
    logger
  )
}

describe('#scaleEcsToZeroInEnvironment', () => {
  test('should call scaleEcsToZero', async () => {
    await callScaleEcsToZeroInEnvironment()

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

  test('if test suite should not call scale to zero', async () => {
    getEntity.mockResolvedValue({ name: 'some-service', type: 'TestSuite' })

    await callScaleEcsToZeroInEnvironment()

    expect(getEntity).toHaveBeenCalledTimes(1)
    expect(scaleEcsToZero).toHaveBeenCalledTimes(0)
  })
})
