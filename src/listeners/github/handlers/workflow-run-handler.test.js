import { workflowRunHandler } from '~/src/listeners/github/handlers/workflow-run-handler'
import { updateCreationStatus } from '~/src/api/create/helpers/save-status'
import { octokit } from '~/src/helpers/oktokit'

jest.mock('~/src/api/create/helpers/save-status', () => ({
  updateCreationStatus: jest.fn(),
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

describe('#workflow-run-handler', () => {
  test('Should ignore workflow events that are not on the main branch', async () => {
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

    await workflowRunHandler({}, msg)
    expect(updateCreationStatus).toHaveBeenCalledTimes(0)
  })

  test('Should update the status of test-repo if its not successfully completed yet', async () => {
    const findOne = jest.fn().mockReturnValue({ repositoryName: 'test-repo' })
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
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '/test',
        head_branch: 'main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f'
      },
      repository: {
        name: 'tf-svc',
        owner: {
          login: 'test-org'
        }
      }
    }
    await workflowRunHandler(mockDb, msg)
    expect(findOne).toHaveBeenCalledWith({
      'tf-svc.merged_sha': '6d96270004515a0486bb7f76196a72b40c55a47f'
    })
    expect(updateOne).toHaveBeenCalledWith(
      { repositoryName: 'test-repo' },
      {
        $set: {
          'tf-svc.status': 'in-progress',
          'tf-svc.workflow': {
            name: 'wf-name',
            html_url: 'http://localhost',
            created_at: new Date(0),
            updated_at: new Date(0),
            path: '/test'
          }
        }
      }
    )
  })

  test('Should trigger the next stages if tf-svc-infras workflow was successfully run', async () => {
    const findOne = jest.fn().mockReturnValue({
      repositoryName: 'test-repo',
      zone: 'protected',
      createRepository: { status: 'not-requested', payload: {} },
      'cdp-app-config': { pr: { number: 1 } },
      'tf-svc': { status: 'not-requested' },
      'cdp-nginx-upstreams': { pr: { number: 3 } }
    })
    const updateOne = jest.fn().mockReturnValue({})
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOne,
        updateOne
      })
    }

    octokit.createPullRequest.mockReturnValue({
      data: {
        node_id: 'PR_aabbccdd',
        number: 2,
        head: { sha: '05129eae0a11464d5c3a6bd3839b67a2e7f9c933' }
      }
    })
    octokit.request.mockImplementation(() => {})
    octokit.rest.pulls.merge.mockImplementation(() => {
      return { data: { merged: true } }
    })

    const msg = {
      github_event: 'workflow_run',
      action: 'completed',
      workflow_run: {
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '/test',
        head_branch: 'main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f',
        conclusion: 'success'
      },
      repository: {
        name: 'tf-svc-infra',
        owner: {
          login: 'test-org'
        }
      }
    }
    await workflowRunHandler(mockDb, msg)
    expect(findOne).toHaveBeenCalledWith({
      'tf-svc-infra.merged_sha': '6d96270004515a0486bb7f76196a72b40c55a47f'
    })

    expect(octokit.request).toHaveBeenCalledTimes(1)

    expect(octokit.rest.pulls.merge).toHaveBeenCalledWith({
      owner: 'test-org',
      pull_number: 1,
      repo: 'cdp-app-config'
    })

    expect(octokit.rest.pulls.merge).toHaveBeenCalledWith({
      owner: 'test-org',
      pull_number: 2,
      repo: 'tf-svc'
    })

    expect(octokit.rest.pulls.merge).toHaveBeenCalledWith({
      owner: 'test-org',
      pull_number: 3,
      repo: 'cdp-nginx-upstreams'
    })
  })
})
