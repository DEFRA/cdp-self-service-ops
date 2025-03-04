import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { undeployServiceFromAllEnvironments } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'
import { orderedEnvironments } from '~/src/config/environments.js'

jest.mock(
  '~/src/api/undeploy/helpers/undeploy-service-from-environment',
  () => {
    return {
      undeployServiceFromEnvironment: jest.fn()
    }
  }
)
const mockLogger = { info: jest.fn() }

const serviceName = 'some-service'
const user = { id: 'some-user-id', displayName: 'some-name' }

describe('#undeployServiceFromAllEnvironments', () => {
  test('Should call undeployServiceFromEnvironment', async () => {
    await undeployServiceFromAllEnvironments(serviceName, user, mockLogger)

    expect(undeployServiceFromEnvironment).toHaveBeenCalledTimes(7)
    orderedEnvironments.forEach((env) => {
      expect(undeployServiceFromEnvironment).toHaveBeenCalledWith(
        serviceName,
        env,
        user,
        mockLogger
      )
    })
  })
})
