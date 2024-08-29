import { bulkUpdateTfSvcInfra } from '~/src/listeners/github/helpers/bulk-update-tf-svc-infra'
import {
  findAllInProgressOrFailed,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'

import { createPlaceholderArtifact } from '~/src/listeners/github/helpers/create-placeholder-artifact'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service'
import { updateOverallStatus } from '~/src/helpers/create/init-creation-status'
import { statuses } from '~/src/constants/statuses'

jest.mock('~/src/helpers/create/init-creation-status', () => ({
  updateOverallStatus: jest.fn()
}))

jest.mock('~/src/listeners/github/helpers/create-placeholder-artifact', () => ({
  createPlaceholderArtifact: jest.fn()
}))

jest.mock('~/src/api/deploy/helpers/lookup-tenant-service', () => ({
  lookupTenantService: jest.fn()
}))

jest.mock('~/src/listeners/github/status-repo', () => ({
  findAllInProgressOrFailed: jest.fn(),
  updateWorkflowStatus: jest.fn()
}))

describe('bulkUpdateTtfSvcInfra', () => {
  test('it should update a service thats pending and has a tenant json entry', async () => {
    findAllInProgressOrFailed.mockResolvedValue([
      {
        repositoryName: 'test1'
      }
    ])
    lookupTenantService.mockResolvedValue({})

    const db = {}
    const workflow = {
      name: 'test1',
      id: 1,
      html_url: `http://localhost:8080/test1`,
      created_at: new Date(),
      updated_at: new Date(),
      path: '.github/workflows/create-service.yml'
    }
    await bulkUpdateTfSvcInfra(db, workflow, statuses.success)

    expect(updateWorkflowStatus).toHaveBeenCalledWith(
      db,
      'test1',
      'cdp-tf-svc-infra',
      'main',
      statuses.success,
      workflow
    )
    expect(updateOverallStatus).toHaveBeenCalledWith(db, 'test1')
    expect(createPlaceholderArtifact).toHaveBeenCalledWith({
      service: 'test1',
      gitHubUrl: `https://github.com/DEFRA/test1`,
      runMode: 'Service'
    })
  })

  test('it should not update a service that doesnt have a tenant json', async () => {
    findAllInProgressOrFailed.mockResolvedValue([
      {
        repositoryName: 'test1'
      }
    ])
    lookupTenantService.mockResolvedValue(null)

    const db = {}
    const workflow = {
      name: 'test1',
      id: 1,
      html_url: `http://localhost:8080/test1`,
      created_at: new Date(),
      updated_at: new Date(),
      path: '.github/workflows/create-service.yml'
    }
    await bulkUpdateTfSvcInfra(db, workflow, statuses.success)

    expect(updateWorkflowStatus).not.toHaveBeenCalled()
    expect(updateOverallStatus).not.toHaveBeenCalled()
    expect(createPlaceholderArtifact).not.toHaveBeenCalled()
  })
})
