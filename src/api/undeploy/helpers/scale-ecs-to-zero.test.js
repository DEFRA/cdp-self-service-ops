import { commitFile } from '~/src//helpers/github/commit-github-file.js'
import { findRunningDetails } from '~/src/helpers/deployments/find-running-details.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'

jest.mock('~/src/helpers/github/commit-github-file', () => {
  return {
    commitFile: jest.fn()
  }
})

jest.mock('~/src/helpers/deployments/find-running-details', () => {
  return {
    findRunningDetails: jest.fn()
  }
})

const logger = {
  info: jest.fn()
}
const someUndeploymentId = 'some-undeployment-id'
const serviceName = 'some-service-name'
const someUser = { id: 'some-user-id', displayName: 'some-name' }
const runningDetails = {
  cdpDeploymentId: 'some-cdp-deployment-id',
  environment: 'infra-dev',
  service: serviceName,
  version: '1.2.3',
  instanceCount: 2,
  cpu: 1024,
  memory: 2048,
  configVersion: 'some-config-version',
  user: { userId: 'some-user-id', displayName: 'some-name' },
  status: 'running'
}

describe('#scaleEcsToZero', () => {
  test('If no existing deployment should not proceed with scale to 0', async () => {
    findRunningDetails.mockReturnValue(null)

    await scaleEcsToZero(
      someUndeploymentId,
      serviceName,
      'dev',
      'public',
      someUser,
      logger
    )

    expect(findRunningDetails).toHaveBeenCalledTimes(1)
    expect(commitFile).toHaveBeenCalledTimes(0)
  })

  test('With existing deployment should proceed with scale to 0', async () => {
    findRunningDetails.mockReturnValue({})

    await scaleEcsToZero(
      someUndeploymentId,
      serviceName,
      'dev',
      'public',
      someUser,
      logger
    )

    expect(findRunningDetails).toHaveBeenCalledTimes(1)
    expect(commitFile).toHaveBeenCalledTimes(1)
  })

  test('Check deployment instance count is ZERO', async () => {
    findRunningDetails.mockReturnValue(runningDetails)

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
        deploymentId: expect.any(String),
        deploy: expect.any(Boolean),
        service: {
          name: serviceName,
          image: serviceName,
          version: expect.any(String),
          configuration: expect.any(Object)
        },
        cluster: expect.any(Object),
        resources: {
          instanceCount: 0,
          cpu: 1024,
          memory: 2048
        },
        metadata: expect.any(Object)
      }),
      logger
    )
  })

  test('Check deployment file contains user', async () => {
    findRunningDetails.mockReturnValue(runningDetails)

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
        deploymentId: expect.any(String),
        deploy: expect.any(Boolean),
        service: expect.any(Object),
        cluster: expect.any(Object),
        resources: expect.any(Object),
        metadata: {
          deploymentEnvironment: expect.any(String),
          user: {
            id: someUser.id,
            displayName: someUser.displayName
          }
        }
      }),
      logger
    )
  })

  test('Check deployment file is correct path', async () => {
    findRunningDetails.mockReturnValue(runningDetails)

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
