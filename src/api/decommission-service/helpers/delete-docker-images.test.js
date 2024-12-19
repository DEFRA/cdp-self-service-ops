import { deleteDockerHubImages } from '~/src/helpers/remove/workflows/delete-dockerhub-images.js'
import { deleteEcrImages } from '~/src/helpers/remove/workflows/delete-ecr-images.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { deleteDockerImages } from '~/src/api/decommission-service/helpers/delete-docker-images.js'

jest.mock('~/src/helpers/feature-toggle/is-feature-enabled', () => {
  return {
    isFeatureEnabled: jest.fn()
  }
})

jest.mock('~/src/helpers/remove/workflows/delete-dockerhub-images', () => {
  return {
    deleteDockerHubImages: jest.fn()
  }
})

jest.mock('~/src/helpers/remove/workflows/delete-ecr-images', () => {
  return {
    deleteEcrImages: jest.fn()
  }
})

const logger = {
  info: jest.fn()
}
const serviceName = 'some-service'
const user = { id: 'some-user-id', displayName: 'some-name' }

describe('#deleteDockerImages', () => {
  test('if not enabled should not call delete ECR images', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await deleteDockerImages(serviceName, user, logger)

    expect(deleteEcrImages).toHaveBeenCalledTimes(0)
  })

  test('if enabled should call delete ECR images', async () => {
    isFeatureEnabled.mockReturnValueOnce(true).mockReturnValue(false)

    await deleteDockerImages(serviceName, user, logger)

    expect(deleteEcrImages).toHaveBeenCalledTimes(1)
    expect(deleteEcrImages).toHaveBeenCalledWith(serviceName, logger)
  })

  test('if not enabled should not call delete DockerHub images', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await deleteDockerImages(serviceName, user, logger)

    expect(deleteDockerHubImages).toHaveBeenCalledTimes(0)
  })

  test('if enabled should call delete DockerHub images', async () => {
    isFeatureEnabled.mockReturnValueOnce(false).mockReturnValue(true)

    await deleteDockerImages(serviceName, user, logger)

    expect(deleteDockerHubImages).toHaveBeenCalledTimes(1)
    expect(deleteDockerHubImages).toHaveBeenCalledWith(serviceName, logger)
  })
})
