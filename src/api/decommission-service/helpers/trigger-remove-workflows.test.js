import { describe, expect, test, vi } from 'vitest'

import { archiveGithubRepo } from '../../../helpers/remove/workflows/archive-github-repo.js'
import { deleteEcrImages } from '../../../helpers/remove/workflows/delete-ecr-images.js'
import { deleteDockerHubImages } from '../../../helpers/remove/workflows/delete-dockerhub-images.js'
import { removeDashboard } from '../../../helpers/remove/workflows/remove-dashboard.js'
import { removeNginxUpstreams } from '../../../helpers/remove/workflows/remove-nginx-upstreams.js'
import { removeAppConfig } from '../../../helpers/remove/workflows/remove-app-config.js'
import { removeSquidConfig } from '../../../helpers/remove/workflows/remove-squid-config.js'
import { removeTenantInfrastructure } from '../../../helpers/remove/workflows/remove-tenant-infrastructure.js'

vi.mock('../../../helpers/oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn(),
  request: vi.fn()
}))

vi.mock('../../../helpers/remove/workflows/archive-github-repo.js')
vi.mock('../../../helpers/remove/workflows/delete-ecr-images.js')
vi.mock('../../../helpers/remove/workflows/delete-dockerhub-images.js')
vi.mock('../../../helpers/remove/workflows/remove-dashboard.js')
vi.mock('../../../helpers/remove/workflows/remove-nginx-upstreams.js')
vi.mock('../../../helpers/remove/workflows/remove-app-config.js')
vi.mock('../../../helpers/remove/workflows/remove-squid-config.js')
vi.mock('../../../helpers/remove/workflows/remove-tenant-infrastructure.js')

const logger = {
  info: vi.fn()
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
    const { triggerRemoveWorkflows } = await import(
      './trigger-remove-workflows.js'
    )

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
    const { triggerRemoveWorkflows } = await import(
      './trigger-remove-workflows.js'
    )

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
    const { triggerRemoveWorkflows } = await import(
      './trigger-remove-workflows.js'
    )

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
