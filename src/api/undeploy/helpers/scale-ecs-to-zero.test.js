import { commitFile } from '~/src//helpers/github/commit-github-file.js'
import { getExistingDeployment } from '~/src/api/deploy/helpers/get-existing-deployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'

jest.mock('~/src/helpers/github/commit-github-file', () => {
  return {
    commitFile: jest.fn()
  }
})

jest.mock('~/src/api/deploy/helpers/get-existing-deployment', () => {
  return {
    getExistingDeployment: jest.fn()
  }
})

const logger = {
  info: jest.fn()
}
const someUndeploymentId = 'some-undeployment-id'
const serviceName = 'some-service-name'
const someUser = { id: 'some-user-id', displayName: 'some-name' }
const existingDeployment = {
  name: 'some-service-name',
  resources: {
    instanceCount: 2,
    cpu: 1024,
    memory: 2048
  },
  cluster: {
    environment: 'infra-dev',
    zone: 'public'
  }
}

describe('#scaleEcsToZero', () => {
  test('If no existing deployment should not proceed with scale to 0', async () => {
    getExistingDeployment.mockReturnValue(null)

    await scaleEcsToZero(
      someUndeploymentId,
      serviceName,
      'dev',
      'public',
      someUser,
      logger
    )

    expect(getExistingDeployment).toHaveBeenCalledTimes(1)
    expect(commitFile).toHaveBeenCalledTimes(0)
  })

  test('With existing deployment should proceed with scale to 0', async () => {
    getExistingDeployment.mockReturnValue({})

    await scaleEcsToZero(
      someUndeploymentId,
      serviceName,
      'dev',
      'public',
      someUser,
      logger
    )

    expect(getExistingDeployment).toHaveBeenCalledTimes(1)
    expect(commitFile).toHaveBeenCalledTimes(1)
  })

  test('Check deployment instance count is ZERO', async () => {
    getExistingDeployment.mockReturnValue(existingDeployment)

    await scaleEcsToZero(
      someUndeploymentId,
      serviceName,
      'infra-dev',
      'public',
      someUser,
      logger
    )

    expect(commitFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        name: 'some-service-name',
        deploymentId: expect.any(String),
        resources: {
          instanceCount: 0,
          cpu: 1024,
          memory: 2048
        },
        cluster: existingDeployment.cluster,
        metadata: expect.any(Object)
      }),
      logger
    )
  })

  test('Check deployment file contains user', async () => {
    getExistingDeployment.mockReturnValue(existingDeployment)

    await scaleEcsToZero(
      someUndeploymentId,
      serviceName,
      'infra-dev',
      'public',
      someUser,
      logger
    )

    expect(commitFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        name: 'some-service-name',
        deploymentId: expect.any(String),
        resources: expect.any(Object),
        cluster: existingDeployment.cluster,
        metadata: {
          user: {
            userId: someUser.id,
            displayName: someUser.displayName
          }
        }
      }),
      logger
    )
  })

  test('Check deployment file is correct path', async () => {
    getExistingDeployment.mockReturnValue(existingDeployment)

    await scaleEcsToZero(
      someUndeploymentId,
      serviceName,
      'infra-dev',
      'public',
      someUser,
      logger
    )

    expect(commitFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      `environments/infra-dev/public/${serviceName}.json`,
      expect.any(Object),
      logger
    )
  })
})
