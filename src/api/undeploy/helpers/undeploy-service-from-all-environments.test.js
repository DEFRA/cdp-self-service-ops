import { undeployService } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { undeployWithId } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'

jest.mock(
  '~/src/api/undeploy/helpers/undeploy-service-from-environment',
  () => {
    return {
      undeployService: jest.fn()
    }
  }
)

const orderedEnvironments = ['dev', 'test']

jest.mock('~/src/config/environments', () => {
  return {
    environments: { dev: 'dev', test: 'test' },
    orderedEnvironments
  }
})

const mockLogger = { info: jest.fn() }

const undeploymentId = crypto.randomUUID()
const imageName = 'some-service'
const user = { id: 'some-user-id', displayName: 'some-name' }

describe('#undeployServiceFromAllEnvironments', () => {
  test('Should call undeployServiceFromEnvironment', async () => {
    await undeployWithId(
      undeploymentId,
      imageName,
      user,
      orderedEnvironments,
      mockLogger
    )

    expect(undeployService).toHaveBeenCalledTimes(2)
    expect(undeployService).toHaveBeenCalledWith(
      undeploymentId,
      imageName,
      'dev',
      user,
      mockLogger
    )
    expect(undeployService).toHaveBeenCalledWith(
      undeploymentId,
      imageName,
      'test',
      user,
      mockLogger
    )
  })
})
