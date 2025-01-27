import { deleteDockerHubImages } from '~/src/helpers/remove/workflows/delete-dockerhub-images.js'
import { deleteEcrImages } from '~/src/helpers/remove/workflows/delete-ecr-images.js'
import { deleteDockerImages } from '~/src/api/decommission-service/helpers/delete-docker-images.js'

jest.mock('~/src/helpers/remove/workflows/delete-dockerhub-images')
jest.mock('~/src/helpers/remove/workflows/delete-ecr-images')

const logger = { info: jest.fn() }
const serviceName = 'some-service'
const user = { id: 'some-user-id', displayName: 'some-name' }

describe('#deleteDockerImages', () => {
  test('should call delete ECR images', async () => {
    await deleteDockerImages(serviceName, user, logger)

    expect(deleteEcrImages).toHaveBeenCalledTimes(1)
    expect(deleteEcrImages).toHaveBeenCalledWith(serviceName, logger)
  })

  test('should call delete DockerHub images', async () => {
    await deleteDockerImages(serviceName, user, logger)

    expect(deleteDockerHubImages).toHaveBeenCalledTimes(1)
    expect(deleteDockerHubImages).toHaveBeenCalledWith(serviceName, logger)
  })
})
