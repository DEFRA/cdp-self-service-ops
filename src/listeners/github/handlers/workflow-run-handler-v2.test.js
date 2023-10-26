import { workflowRunHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-handler-v2'
import { updateWorkflowStatus } from '~/src/api/create/helpers/save-status'

jest.mock('~/src/api/create/helpers/save-status', () => ({
  updateWorkflowStatus: jest.fn(),
  findByCommitHash: jest.fn()
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
    expect(updateWorkflowStatus).toHaveBeenCalledTimes(0)
  })

  test('set status to failed status when a workflow run fails', async () => {
    const mockStatusRecord = {
      repositoryName: 'test-repo',
      zone: 'protected',
      status: 'in-progress',
      createRepository: { status: 'not-requested' },
      'cdp-app-config': { status: 'success' },
      'tf-svc-infra': { status: 'not-requested' },
      'cdp-nginx-upstreams': { status: 'not-requested' }
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
        conclusion: 'failure'
      },
      repository: {
        name: 'tf-svc-infra',
        owner: {
          login: 'test-org'
        }
      }
    }
    await workflowRunHandlerV2(mockDb, msg)
    expect(findOne).toHaveBeenCalledWith({
      'tf-svc-infra.merged_sha': '6d96270004515a0486bb7f76196a72b40c55a47f'
    })

    expect(updateOne).toHaveBeenNthCalledWith(
      1,
      { repositoryName: 'test-repo' },
      {
        $set: {
          'tf-svc-infra.main.workflow': {
            id: 999,
            name: 'wf-name',
            html_url: 'http://localhost',
            created_at: new Date(0),
            updated_at: new Date(0),
            path: '/test'
          },

          'tf-svc-infra.status': 'failure'
        }
      }
    )
  })

  test('set overall status to in-progress when something hasnt finished', async () => {
    const mockStatusRecord = {
      repositoryName: 'test-repo',
      zone: 'protected',
      status: 'in-progress',
      createRepository: { status: 'success' },
      'cdp-app-config': { status: 'success' },
      'tf-svc-infra': { status: 'in-progress' },
      'cdp-nginx-upstreams': { status: 'in-progress' }
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
      action: 'in-progress',
      workflow_run: {
        id: 999,
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '/test',
        head_branch: 'main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f',
        conclusion: 'failure'
      },
      repository: {
        name: 'tf-svc-infra',
        owner: {
          login: 'test-org'
        }
      }
    }
    await workflowRunHandlerV2(mockDb, msg)
    expect(findOne).toHaveBeenCalledWith({
      'tf-svc-infra.merged_sha': '6d96270004515a0486bb7f76196a72b40c55a47f'
    })

    expect(updateOne).toHaveBeenLastCalledWith(
      { repositoryName: 'test-repo' },
      {
        $set: {
          status: 'in-progress'
        }
      }
    )
  })
})
