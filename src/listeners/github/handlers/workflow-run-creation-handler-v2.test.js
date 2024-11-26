import { statuses } from '~/src/constants/statuses.js'
import {
  shouldWorkflowBeProcessed,
  workflowRunCreationHandlerV2
} from '~/src/listeners/github/handlers/workflow-run-creation-handler-v2.js'
import { handleTriggeredWorkflow } from '~/src/listeners/github/handlers/handle-triggered-workflow.js'
import { handleTfSvcInfraWorkflow } from '~/src/listeners/github/handlers/handle-tf-svc-infra-workflow.js'

jest.mock('~/src/listeners/github/handlers/handle-triggered-workflow', () => {
  return {
    handleTriggeredWorkflow: jest.fn()
  }
})

jest.mock(
  '~/src/listeners/github/handlers/handle-tf-svc-infra-workflow',
  () => ({
    handleTfSvcInfraWorkflow: jest.fn()
  })
)

const mockServer = {
  db: {}
}

describe('#workflow-run-handler-v2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should not process workflows that are not on the main branch', async () => {
    const msg = {
      github_event: 'workflow_run',
      action: 'completed',
      workflow_run: {
        head_branch: 'not-main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f',
        path: '.github/workflows/create-service.yml'
      },
      repository: {
        name: 'tf-svc',
        owner: {
          login: 'test-org'
        }
      }
    }

    await workflowRunCreationHandlerV2(mockServer, msg)
    expect(handleTriggeredWorkflow).not.toHaveBeenCalled()
    expect(handleTfSvcInfraWorkflow).not.toHaveBeenCalled()
  })

  test('call handleTriggeredWorkflow for a valid repo thats not cdp-tf-svc-infra', async () => {
    const msg = {
      github_event: 'workflow_run',
      action: 'completed',
      workflow_run: {
        id: 999,
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '.github/workflows/create-service.yml',
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
    await workflowRunCreationHandlerV2(mockServer, msg)
    expect(handleTriggeredWorkflow).toHaveBeenCalled()
    expect(handleTfSvcInfraWorkflow).not.toHaveBeenCalled()
  })

  test('call handleTfSvcInfraWorkflow for a valid repo is cdp-tf-svc-infra', async () => {
    const msg = {
      github_event: 'workflow_run',
      action: 'completed',
      workflow_run: {
        id: 999,
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '.github/workflows/create-service.yml',
        head_branch: 'main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f',
        conclusion: statuses.failure
      },
      repository: {
        name: 'cdp-tf-svc-infra',
        owner: {
          login: 'test-org'
        }
      }
    }
    await workflowRunCreationHandlerV2(mockServer, msg)
    expect(handleTriggeredWorkflow).not.toHaveBeenCalled()
    expect(handleTfSvcInfraWorkflow).toHaveBeenCalled()
  })

  test('not process anything that is an unsupported repo', async () => {
    jest.mock('~/src/helpers/create/init-creation-status', () => ({
      updateWorkflowStatus: jest.fn(),
      findByCommitHash: jest.fn()
    }))

    const msg = {
      github_event: 'workflow_run',
      action: statuses.inProgress,
      workflow_run: {
        id: 999,
        name: 'wf-name',
        html_url: 'http://localhost',
        created_at: new Date(0),
        updated_at: new Date(0),
        path: '.github/workflows/create-service.yml',
        head_branch: 'main',
        head_sha: '6d96270004515a0486bb7f76196a72b40c55a47f',
        conclusion: statuses.failure
      },
      repository: {
        name: 'cdp-portal-frontend',
        owner: {
          login: 'test-org'
        }
      }
    }
    await workflowRunCreationHandlerV2(mockServer, msg)
    expect(handleTriggeredWorkflow).not.toHaveBeenCalled()
    expect(handleTfSvcInfraWorkflow).not.toHaveBeenCalled()
  })
})

describe('#shouldWorkflowBeProcessed', () => {
  test('Should return false for unknown repos', () => {
    expect(
      shouldWorkflowBeProcessed('invalid-repo', 'create-service.yml')
    ).toBe(false)
  })

  test('Should return false for valid repo but invalid workflow', () => {
    expect(shouldWorkflowBeProcessed('cdp-app-config', 'invalid.yml')).toBe(
      false
    )
  })

  test('Should return true for valid repo but invalid workflow', () => {
    expect(
      shouldWorkflowBeProcessed('cdp-app-config', 'create-service.yml')
    ).toBe(true)
  })
})
