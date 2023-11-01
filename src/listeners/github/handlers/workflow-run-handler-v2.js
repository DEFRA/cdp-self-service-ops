import {
  findByCommitHash,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import { createLogger } from '~/src/helpers/logging/logger'
import { updateOverallStatus } from '~/src/api/createV2/helpers/save-status'
import { config } from '~/src/config'
import { createPlaceholderArtifact } from '~/src/listeners/github/helpers/createPlaceholderArtifact'

const workflowRunHandlerV2 = async (db, message) => {
  const logger = createLogger()
  const workflowRepo = message.repository?.name
  const headBranch = message.workflow_run?.head_branch
  const headSHA = message.workflow_run?.head_sha
  try {
    logger.info(
      `processing workflow_run message for ${workflowRepo}, ${headBranch}/${headSHA}, action: ${message.action}`
    )

    const status = await findByCommitHash(db, workflowRepo, headSHA)
    if (status === null) {
      logger.info(
        `skipping workflow_run, not a tracked commit ${workflowRepo} ${headSHA}`
      )
      return
    }

    const serviceRepo = status.repositoryName

    if (
      workflowRepo === config.get('githubRepoTfServiceInfra') &&
      message.action === 'completed' &&
      message.workflow_run?.conclusion === 'success'
    ) {
      logger.info(
        `triggering next steps in the creation of ${workflowRepo}`
        // TODO: enable anything we need to do once the repo is up
      )

      await createPlaceholderArtifact({
        service: status.repositoryName,
        githubUrl: status?.createRepository?.url
      })
    }

    // Record what happened
    const workflowStatus = normalizeStatus(
      message.action,
      message.workflow_run?.conclusion
    )
    logger.info(
      `updating status for creation job ${serviceRepo} ${workflowRepo}:${workflowStatus}`
    )

    let branch = 'pr'
    if (headBranch === 'main') {
      branch = 'main'
    }
    await updateWorkflowStatus(
      db,
      serviceRepo,
      workflowRepo,
      branch,
      workflowStatus,
      trimWorkflowRun(message.workflow_run)
    )

    await updateOverallStatus(db, serviceRepo)
  } catch (e) {
    logger.error(e)
  }
}

const trimWorkflowRun = (workflowRun) => {
  return {
    name: workflowRun.name,
    id: workflowRun.id,
    html_url: workflowRun.html_url,
    created_at: workflowRun.created_at,
    updated_at: workflowRun.updated_at,
    path: workflowRun.path
  }
}

const normalizeStatus = (action, conclusion) => {
  switch (action) {
    case 'completed':
      switch (conclusion) {
        case 'success':
          return 'success'
        case 'skipped':
          return 'success'
        default:
          return 'failure'
      }
    case 'in_progress':
      return 'in-progress'
    case 'in-progress':
      return 'in-progress'
    case 'requested':
      return 'requested'
    default:
      return 'requested'
  }
}

export { workflowRunHandlerV2 }
