import { findRunningDetails } from '~/src/helpers/deployments/find-running-details.js'
import { commitDeploymentFile } from '~/src/helpers/deployments/commit-deployment-file.js'
import { scaleEcsToZero } from '~/src/api/decommission-service/helpers/scale-ecs-to-zero.js'
import { randomUUID } from 'node:crypto'

jest.mock('~/src/helpers/deployments/find-running-details.js')
jest.mock('~/src/helpers/deployments/commit-deployment-file.js')

const logger = {
  info: jest.fn()
}
const someUndeploymentId = 'some-undeployment-id'
const serviceName = 'some-service-name'
const someUser = { id: randomUUID(), displayName: 'some-name' }
const runningDetails = {
  cdpDeploymentId: randomUUID(),
  environment: 'infra-dev',
  service: serviceName,
  version: '1.2.3',
  instanceCount: 2,
  cpu: 1024,
  memory: 2048,
  configVersion: 'some-config-version',
  user: { id: randomUUID(), displayName: 'other-name' },
  status: 'running'
}

describe('#scaleEcsToZero', () => {
  test('If no data (null) should not proceed with scale to 0', async () => {
    findRunningDetails.mockReturnValue(null)

    await scaleEcsToZero(
      serviceName,
      'dev',
      'public',
      someUser,
      someUndeploymentId,
      logger
    )

    expect(findRunningDetails).toHaveBeenCalledTimes(1)
    expect(commitDeploymentFile).toHaveBeenCalledTimes(0)
  })

  test('If no existing deployment should not proceed with scale to 0', async () => {
    findRunningDetails.mockReturnValue({})

    await scaleEcsToZero(
      serviceName,
      'dev',
      'public',
      someUser,
      someUndeploymentId,
      logger
    )

    expect(findRunningDetails).toHaveBeenCalledTimes(1)
    expect(commitDeploymentFile).toHaveBeenCalledTimes(0)
  })

  test('If existing deployment is already scaled to 0 do nothing', async () => {
    findRunningDetails.mockReturnValue({
      ...runningDetails,
      instanceCount: 0
    })

    await scaleEcsToZero(
      serviceName,
      'dev',
      'public',
      someUser,
      someUndeploymentId,
      logger
    )

    expect(findRunningDetails).toHaveBeenCalledTimes(1)
    expect(commitDeploymentFile).toHaveBeenCalledTimes(0)
  })

  test('With existing deployment should proceed with scale to 0', async () => {
    findRunningDetails.mockReturnValue(runningDetails)

    await scaleEcsToZero(
      serviceName,
      'dev',
      'public',
      someUser,
      someUndeploymentId,
      logger
    )

    expect(findRunningDetails).toHaveBeenCalledTimes(1)
    expect(commitDeploymentFile).toHaveBeenCalledTimes(1)
  })

  test('Check deployment instance count is ZERO', async () => {
    findRunningDetails.mockReturnValue(runningDetails)

    await scaleEcsToZero(
      serviceName,
      'dev',
      'public',
      someUser,
      someUndeploymentId,
      logger
    )

    expect(commitDeploymentFile).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: {
          instanceCount: 0,
          cpu: expect.any(Number),
          memory: expect.any(Number)
        }
      }),
      logger
    )
  })

  test('Check deployment file contains user', async () => {
    findRunningDetails.mockReturnValue(runningDetails)

    await scaleEcsToZero(
      serviceName,
      'dev',
      'public',
      someUser,
      someUndeploymentId,
      logger
    )

    expect(commitDeploymentFile).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: {
          deploymentEnvironment: expect.any(String),
          user: {
            userId: someUser.id,
            displayName: someUser.displayName
          }
        }
      }),
      logger
    )
  })
})
