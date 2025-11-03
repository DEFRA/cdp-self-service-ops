vi.mock('../../../helpers/oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

const getEntity = vi.fn()
vi.mock('../../../helpers/portal-backend/get-entity.js', () => ({ getEntity }))

const scaleEcsToZero = vi.fn()
vi.mock('./scale-ecs-to-zero.js', () => ({
  scaleEcsToZero
}))

const lookupTenantService = vi.fn()
vi.mock('../../../helpers/portal-backend/lookup-tenant-service.js', () => ({
  lookupTenantService
}))

const logger = { info: vi.fn(), warn: vi.fn() }
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

describe('#scaleEcsToZeroInEnvironment', () => {
  let scaleEcsToZeroInEnvironment

  beforeAll(async () => {
    const module = await import('./scale-ecs-to-zero-in-environment.js')

    scaleEcsToZeroInEnvironment = module.scaleEcsToZeroInEnvironment
  })

  async function callScaleEcsToZeroInEnvironment() {
    return await scaleEcsToZeroInEnvironment(
      repositoryName,
      environment,
      user,
      logger
    )
  }

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

  test('if repository should not call scale to zero', async () => {
    getEntity.mockResolvedValue({ name: 'some-service', type: 'Repository' })

    await callScaleEcsToZeroInEnvironment()

    expect(getEntity).toHaveBeenCalledTimes(1)
    expect(scaleEcsToZero).toHaveBeenCalledTimes(0)
  })
})
