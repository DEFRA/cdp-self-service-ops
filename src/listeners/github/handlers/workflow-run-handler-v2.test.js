import { statuses } from '~/src/constants/statuses'
import { workflowRunHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-handler-v2'
import { findByCommitHash } from '~/src/helpers/db/status/find-by-commit-hash'
import { updateSubStatus } from '~/src/helpers/db/status/update-sub-status'

jest.mock('~/src/helpers/db/status/find-by-commit-hash', () => ({
  findByCommitHash: jest.fn()
}))

jest.mock('~/src/helpers/db/status/update-sub-status', () => ({
  updateSubStatus: jest.fn()
}))

jest.mock('~/src/helpers/oktokit', () => ({
  octokit: {
    createPullRequest: jest.fn(),
    request: jest.fn(),
    graphql: jest.fn(),
    rest: {
      pulls: {
        merge: jest.fn()
      }
    }
  }
}))

jest.mock('~/src/listeners/github/helpers/create-placeholder-artifact', () => ({
  createPlaceholderArtifact: jest.fn()
}))

describe('#workflow-run-handler-v2', () => {
  test('Should ignore workflow events that are not tracked', async () => {
    const msg = {
      github_event: 'workflow_run',
      action: 'completed',
      workflow_run: {
        head_branch: 'not-main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f'
      },
      repository: {
        name: 'tf-svc',
        owner: {
          login: 'test-org'
        }
      }
    }

    await workflowRunHandlerV2({}, msg)
  })

  test('set status to failed status when a workflow run fails', async () => {
    const mockStatusRecord = {
      repositoryName: 'test-repo',
      zone: 'protected',
      status: statuses.inProgress,
      createRepository: { status: statuses.notRequested },
      'cdp-app-config': { status: statuses.success },
      'cdp-tf-svc-infra': { status: statuses.notRequested },
      'cdp-nginx-upstreams': { status: statuses.notRequested }
    }

    const findOne = jest.fn().mockReturnValue(mockStatusRecord)
    const updateOne = jest.fn().mockReturnValue({})
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOne,
        updateOne
      })
    }

    findByCommitHash.mockReturnValue(mockStatusRecord)

    const msg = {
      github_event: 'workflow_run',
      action: 'completed',
      workflow_run: {
        id: 999,
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '/test',
        head_branch: 'main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f',
        conclusion: statuses.failure
      },
      repository: {
        name: 'cdp-app-config',
        owner: {
          login: 'test-org'
        }
      }
    }

    await workflowRunHandlerV2(mockDb, msg)
    expect(findByCommitHash).toHaveBeenCalledWith(
      mockDb,
      'cdp-app-config',
      '6d96270004515a0486bb7f76196a72b40c55a47f'
    )

    expect(updateSubStatus).toHaveBeenCalledWith(
      mockDb,
      'test-repo',
      'cdp-app-config',
      statuses.failure,
      {
        'main.workflow': {
          created_at: new Date(0),
          html_url: 'http://localhost',
          id: 999,
          name: 'wf-name',
          path: '/test',
          updated_at: new Date(0)
        }
      }
    )
  })

  test('set overall status to in-progress when something hasnt finished', async () => {
    const mockStatusRecord = {
      repositoryName: 'test-repo',
      zone: 'protected',
      status: statuses.inProgress,
      createRepository: { status: statuses.success },
      'cdp-app-config': { status: statuses.success },
      'tf-svc-infra': { status: statuses.inProgress },
      'cdp-nginx-upstreams': { status: statuses.inProgress }
    }
    const findOne = jest.fn().mockReturnValue(mockStatusRecord)
    const updateOne = jest.fn().mockReturnValue({})
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOne,
        updateOne
      })
    }

    const msg = {
      github_event: 'workflow_run',
      action: statuses.inProgress,
      workflow_run: {
        id: 999,
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '/test',
        head_branch: 'main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f',
        conclusion: statuses.failure
      },
      repository: {
        name: 'tf-svc-infra',
        owner: {
          login: 'test-org'
        }
      }
    }
    await workflowRunHandlerV2(mockDb, msg)
    expect(findByCommitHash).toHaveBeenCalledWith(
      mockDb,
      'tf-svc-infra',
      '6d96270004515a0486bb7f76196a72b40c55a47f'
    )
  })
})
