import { undeployServiceFromEnvironmentWithId } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { undeployWithId } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'

jest.mock(
  '~/src/api/undeploy/helpers/undeploy-service-from-environment',
  () => {
    return {
      undeployServiceFromEnvironmentWithId: jest.fn()
    }
  }
)

jest.mock('~/src/config/environments', () => {
  return {
    environments: { env1: 'env1', env2: 'env2', env3: 'env3' },
    orderedEnvironments: ['env1', 'env2', 'env3']
  }
})

const undeploymentId = crypto.randomUUID()
const imageName = 'some-service'
const user = { id: 'some-user-id', displayName: 'some-name' }
const numberOfEnvironments = 3

describe('#undeployServiceFromAllEnvironments', () => {
  test('Should call undeployServiceFromEnvironment', async () => {
    await undeployWithId(undeploymentId, imageName, user)

    expect(undeployServiceFromEnvironmentWithId).toHaveBeenCalledTimes(
      numberOfEnvironments
    )
    expect(undeployServiceFromEnvironmentWithId).toHaveBeenCalledWith(
      undeploymentId,
      imageName,
      'env1',
      user
    )
    expect(undeployServiceFromEnvironmentWithId).toHaveBeenCalledWith(
      undeploymentId,
      imageName,
      'env2',
      user
    )
    expect(undeployServiceFromEnvironmentWithId).toHaveBeenCalledWith(
      undeploymentId,
      imageName,
      'env3',
      user
    )
  })
})
