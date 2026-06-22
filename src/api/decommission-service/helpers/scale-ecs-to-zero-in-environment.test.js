vi.mock('../../../helpers/oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

const getEntity = vi.fn()
vi.mock('../../../helpers/portal-backend/get-entity.js', () => ({ getEntity }))

const deployToZero = vi.fn()
vi.mock('../../deploy/helpers/deploy-to-zero.js', () => ({
  deployToZero
}))

const logger = { info: vi.fn(), warn: vi.fn() }
const snsClient = {}

getEntity.mockResolvedValue({
  name: 'some-service',
  type: 'Microservice',
  subType: 'Frontend',
  environments: {
    dev: {
      tenant_config: {
        zone: 'public'
      }
    }
  }
})
deployToZero.mockResolvedValue('1234')

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
      logger,
      snsClient
    )
  }

  test('should call scaleEcsToZero', async () => {
    await callScaleEcsToZeroInEnvironment()

    expect(deployToZero).toHaveBeenCalledTimes(1)
    expect(deployToZero).toHaveBeenCalledWith(
      { logger, snsClient },
      repositoryName,
      environment,
      user
    )
  })

  test('if test suite should not call scale to zero', async () => {
    getEntity.mockResolvedValue({ name: 'some-service', type: 'TestSuite' })

    await callScaleEcsToZeroInEnvironment()

    expect(getEntity).toHaveBeenCalledTimes(1)
    expect(deployToZero).toHaveBeenCalledTimes(0)
  })

  test('if repository should not call scale to zero', async () => {
    getEntity.mockResolvedValue({ name: 'some-service', type: 'Repository' })

    await callScaleEcsToZeroInEnvironment()

    expect(getEntity).toHaveBeenCalledTimes(1)
    expect(deployToZero).toHaveBeenCalledTimes(0)
  })
})
