import { scaleEcsToZeroInEnvironment } from './scale-ecs-to-zero-in-environment.js'
import { scaleEcsToZeroInAllEnvironments } from './scale-ecs-to-zero-in-all-environments.js'
import { orderedEnvironments } from '../../../config/environments.js'

vi.mock('./scale-ecs-to-zero-in-environment.js', () => {
  return {
    scaleEcsToZeroInEnvironment: vi.fn()
  }
})
const mockLogger = { info: vi.fn() }

const serviceName = 'some-service'
const user = { id: 'some-user-id', displayName: 'some-name' }

describe('#scaleEcsToZeroInAllEnvironments', () => {
  test('Should call scaleEcsToZeroInEnvironment', async () => {
    await scaleEcsToZeroInAllEnvironments(serviceName, user, mockLogger)

    expect(scaleEcsToZeroInEnvironment).toHaveBeenCalledTimes(7)
    orderedEnvironments.forEach((env) => {
      expect(scaleEcsToZeroInEnvironment).toHaveBeenCalledWith(
        serviceName,
        env,
        user,
        mockLogger
      )
    })
  })
})
