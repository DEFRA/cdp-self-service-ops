import { triggerRemoveWorkflows } from './trigger-remove-workflows.js'
import { archiveGithubRepo } from '~/src/helpers/remove/workflows/archive-github-repo.js'
import { deleteEcrImages } from '~/src/helpers/remove/workflows/delete-ecr-images.js'
import { deleteDockerHubImages } from '~/src/helpers/remove/workflows/delete-dockerhub-images.js'
import { removeDashboard } from '~/src/helpers/remove/workflows/remove-dashboard.js'
import { removeNginxUpstreams } from '~/src/helpers/remove/workflows/remove-nginx-upstreams.js'
import { removeAppConfig } from '~/src/helpers/remove/workflows/remove-app-config.js'
import { removeSquidConfig } from '~/src/helpers/remove/workflows/remove-squid-config.js'
import { removeTenantInfrastructure } from '~/src/helpers/remove/workflows/remove-tenant-infrastructure.js'

jest.mock('~/src/helpers/remove/workflows/archive-github-repo.js')
jest.mock('~/src/helpers/remove/workflows/delete-ecr-images.js')
jest.mock('~/src/helpers/remove/workflows/delete-dockerhub-images.js')
jest.mock('~/src/helpers/remove/workflows/remove-dashboard.js')
jest.mock('~/src/helpers/remove/workflows/remove-nginx-upstreams.js')
jest.mock('~/src/helpers/remove/workflows/remove-app-config.js')
jest.mock('~/src/helpers/remove/workflows/remove-squid-config.js')
jest.mock('~/src/helpers/remove/workflows/remove-tenant-infrastructure.js')

const logger = {
  info: jest.fn()
}

describe('#triggerRemoveWorkflows', () => {
  const serviceName = 'some-service'
  const backendEntity = {
    Type: 'Microservice',
    SubType: 'Backend'
  }
  const frontendEntity = {
    Type: 'Microservice',
    SubType: 'Frontend'
  }
  const testEntity = {
    Type: 'TestSuite',
    SubType: 'Journey'
  }

  test('Should trigger relevant workflows when run for backend repo', async () => {
    await triggerRemoveWorkflows(serviceName, backendEntity, logger)

    expect(deleteEcrImages).toHaveBeenCalledWith(serviceName, logger)
    expect(deleteDockerHubImages).toHaveBeenCalledWith(serviceName, logger)

    expect(removeDashboard).toHaveBeenCalledWith(serviceName, logger)
    expect(removeNginxUpstreams).toHaveBeenCalledWith(
      serviceName,
      'Protected',
      logger
    )
    expect(removeAppConfig).toHaveBeenCalledWith(serviceName, logger)
    expect(removeSquidConfig).toHaveBeenCalledWith(serviceName, logger)
    expect(removeTenantInfrastructure).toHaveBeenCalledWith(serviceName, logger)
    expect(archiveGithubRepo).toHaveBeenCalledWith(serviceName, logger)
  })

  test('Should trigger relevant workflows when run for frontend repo', async () => {
    await triggerRemoveWorkflows(serviceName, frontendEntity, logger)

    expect(deleteEcrImages).toHaveBeenCalledWith(serviceName, logger)
    expect(deleteDockerHubImages).toHaveBeenCalledWith(serviceName, logger)

    expect(removeDashboard).toHaveBeenCalledWith(serviceName, logger)
    expect(removeNginxUpstreams).toHaveBeenCalledWith(
      serviceName,
      'Public',
      logger
    )
    expect(removeAppConfig).toHaveBeenCalledWith(serviceName, logger)
    expect(removeSquidConfig).toHaveBeenCalledWith(serviceName, logger)
    expect(removeTenantInfrastructure).toHaveBeenCalledWith(serviceName, logger)
    expect(archiveGithubRepo).toHaveBeenCalledWith(serviceName, logger)
  })

  test('Should trigger relevant workflows when run for test suite', async () => {
    await triggerRemoveWorkflows(serviceName, testEntity, logger)

    expect(deleteEcrImages).toHaveBeenCalledWith(serviceName, logger)
    expect(deleteDockerHubImages).toHaveBeenCalledWith(serviceName, logger)

    expect(removeDashboard).not.toHaveBeenCalled()
    expect(removeNginxUpstreams).not.toHaveBeenCalled()
    expect(removeAppConfig).toHaveBeenCalledWith(serviceName, logger)
    expect(removeSquidConfig).toHaveBeenCalledWith(serviceName, logger)
    expect(removeTenantInfrastructure).toHaveBeenCalledWith(serviceName, logger)
    expect(archiveGithubRepo).toHaveBeenCalledWith(serviceName, logger)
  })
})
