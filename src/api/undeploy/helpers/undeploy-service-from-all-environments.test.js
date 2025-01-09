import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { undeployServiceFromAllEnvironments } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'

jest.mock(
  '~/src/api/undeploy/helpers/undeploy-service-from-environment',
  () => {
    return {
      undeployServiceFromEnvironment: jest.fn()
    }
  }
)
const mockLogger = { info: jest.fn() }

const orderedEnvironments = ['dev', 'test']
const undeploymentId = crypto.randomUUID()
const serviceName = 'some-service'
const user = { id: 'some-user-id', displayName: 'some-name' }

describe('#undeployServiceFromAllEnvironments', () => {
  test('Should call undeployServiceFromEnvironment', async () => {
    await undeployServiceFromAllEnvironments({
      serviceName,
      user,
      undeploymentId,
      environments: orderedEnvironments,
      logger: mockLogger
    })

    expect(undeployServiceFromEnvironment).toHaveBeenCalledTimes(2)
    expect(undeployServiceFromEnvironment).toHaveBeenCalledWith({
      serviceName,
      environment: 'dev',
      user,
      undeploymentId,
      logger: mockLogger
    })
    expect(undeployServiceFromEnvironment).toHaveBeenCalledWith({
      serviceName,
      environment: 'test',
      user,
      undeploymentId,
      logger: mockLogger
    })
  })
})
