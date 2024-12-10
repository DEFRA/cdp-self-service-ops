import { handleTriggeredWorkflow } from '~/src/listeners/github/handlers/handle-triggered-workflow.js'
import { updateOverallStatus } from '~/src/helpers/create/init-creation-status.js'
import {
  findByRepoName,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo.js'

jest.mock('~/src/helpers/create/init-creation-status', () => {
  return {
    updateOverallStatus: jest.fn()
  }
})
jest.mock('~/src/listeners/github/status-repo', () => {
  return {
    findByRepoName: jest.fn(),
    updateWorkflowStatus: jest.fn()
  }
})

const db = {
  collection: jest.fn().mockReturnThis(),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
}
const logger = {
  info: jest.fn(),
  error: jest.fn()
}

describe('#handleTriggeredWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const repoStatus = {
    repositoryName: 'tf-svc',
    'tf-svc': {
      status: 'in-progress'
    }
  }
  findByRepoName.mockResolvedValue(repoStatus)

  const rawMessage = {
    action: 'completed',
    repository: { name: 'test-repo' },
    workflow_run: {
      head_branch: 'main',
      name: 'tf-svc',
      conclusion: 'success',
      id: 999,
      html_url: 'http://localhost',
      created_at: '2021-06-01T00:00:00Z',
      updated_at: '2021-06-01T00:00:00Z',
      path: '.github/workflows/create-service'
    }
  }

  const trimmedWorkflowRun = {
    name: rawMessage.workflow_run.name,
    id: rawMessage.workflow_run.id,
    html_url: rawMessage.workflow_run.html_url,
    created_at: rawMessage.workflow_run.created_at,
    updated_at: rawMessage.workflow_run.updated_at,
    path: rawMessage.workflow_run.path
  }

  test('Should update the status of a workflow run', async () => {
    const message = {
      ...rawMessage,
      workflow_run: {
        ...rawMessage.workflow_run,
        conclusion: 'success'
      }
    }

    await handleTriggeredWorkflow(db, logger, message)

    expect(findByRepoName).toHaveBeenCalledWith(db, 'tf-svc')
    expect(updateWorkflowStatus).toHaveBeenCalledWith(
      db,
      'tf-svc',
      'test-repo',
      'main',
      'success',
      trimmedWorkflowRun
    )
    expect(updateOverallStatus).toHaveBeenCalledWith(db, 'tf-svc')
  })

  test('A cancelled workflow is still in-progress', async () => {
    const message = {
      ...rawMessage,
      workflow_run: {
        ...rawMessage.workflow_run,
        conclusion: 'cancelled'
      }
    }

    await handleTriggeredWorkflow(db, logger, message)

    expect(updateWorkflowStatus).toHaveBeenCalledWith(
      db,
      'tf-svc',
      'test-repo',
      'main',
      'in-progress',
      trimmedWorkflowRun
    )
  })
})
