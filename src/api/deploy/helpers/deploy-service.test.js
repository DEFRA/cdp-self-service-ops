const registerDeployment = vi.fn()
vi.mock('./register-deployment.js', () => {
  return {
    registerDeployment
  }
})

const commitDeploymentFile = vi.fn()
vi.mock('../../../helpers/deployments/commit-deployment-file.js', () => ({
  commitDeploymentFile
}))

const getEntity = vi.fn()
vi.mock('../../../helpers/portal-backend/get-entity.js', () => ({ getEntity }))

const triggerDeployment = vi.fn()
vi.mock('../../../helpers/deployments/trigger-deployment.js', () => ({
  triggerDeployment
}))

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
  },
  metadata: {
    service_code: 'FOO'
  }
})

describe('#deployService', () => {
  const mockSnsClient = {}
  const mockLogger = { info: vi.fn(), error: vi.fn() }

  let deployService

  beforeAll(async () => {
    const module = await import('./deploy-service.js')
    deployService = module.deployService
  })

  test('it deploys via directly to the lambda', async () => {
    const details = {
      imageName: 'some-service',
      environment: 'dev',
      version: '0.1.0',
      instanceCount: 1,
      cpu: 1024,
      memory: 2048,
      configVersion:
        'a4244aa43ddd6e3ef9e64bb80f4ee952f68232aa008d3da9c78e3b627e5675c8'
    }

    const user = { id: '1234', displayName: 'User, Name' }
    const result = await deployService(
      details,
      user,
      mockSnsClient,
      mockLogger,
      true
    )

    expect(registerDeployment).toHaveBeenCalledWith(
      details.imageName,
      details.version,
      details.environment,
      details.instanceCount,
      details.cpu,
      details.memory,
      user,
      expect.any(String),
      details.configVersion
    )

    expect(getEntity).toHaveBeenCalledTimes(1)
    expect(triggerDeployment).toHaveBeenCalledWith(
      {
        deploymentId: result.deploymentId,
        payload: details,
        zone: 'public',
        commitSha: details.configVersion,
        serviceCode: 'FOO',
        deploy: true,
        user
      },
      details.environment,
      mockSnsClient,
      mockLogger
    )

    expect(commitDeploymentFile).toHaveBeenCalledWith(
      {
        cluster: {
          environment: details.environment,
          zone: 'public'
        },
        deploy: true,
        metadata: {
          deploymentEnvironment: 'local',
          user: { userId: user.id, displayName: user.displayName }
        },
        resources: {
          cpu: details.cpu,
          instanceCount: details.instanceCount,
          memory: details.memory
        },
        deploymentId: result.deploymentId,
        service: {
          configuration: {
            commitSha: details.configVersion
          },
          image: details.imageName,
          name: details.imageName,
          serviceCode: 'FOO',
          version: details.version
        }
      },
      expect.anything()
    )

    expect(result.deploymentId).toBeDefined()
  })
})
