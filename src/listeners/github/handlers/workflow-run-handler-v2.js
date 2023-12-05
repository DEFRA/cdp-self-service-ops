import {
  findByCommitHash,
  findByRepoName,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import { createLogger } from '~/src/helpers/logging/logger'
import { updateOverallStatus } from '~/src/api/createV2/helpers/save-status'
import { config } from '~/src/config'
import { bulkUpdateTfSvcInfra } from '~/src/listeners/github/helpers/bulk-update-tf-svc-infra'
import { normalizeStatus } from '~/src/listeners/github/helpers/normalize-status'
import { updateRepositoryStatus } from '~/src/api/create-repository/helpers/status/update-repository-status'

const logger = createLogger()

const workflowRunHandlerV2 = async (db, message) => {
  const workflowRepo = message.repository?.name
  const headBranch = message.workflow_run?.head_branch
  const headSHA = message.workflow_run?.head_sha

  logger.info(
    `processing workflow_run message for ${workflowRepo}, ${headBranch}/${headSHA}, action: ${message.action}`
  )

  switch (workflowRepo) {
    case config.get('githubRepoTfServiceInfra'):
      await handleTfSvcInfra(db, message)
      break
    case config.get('githubRepoCreateWorkflows'):
      await handleCdpCreateWorkflows(db, message)
      break
    default:
      await handleGenericWorkflow(db, message)
      break
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

const handleTfSvcInfra = async (db, message) => {
  try {
    if (
      message.action === 'completed' &&
      message.workflow_run?.head_branch === 'main'
    ) {
      logger.info(`handling tf-svc-infra workflow completed message from main`)

      // Any time cdp-tf-svc-infra completes on main, regardless of which commit triggered it
      // assume all services in management tenant-services.json are successfully created.
      // (we use management as it is responsible for the ECR)
      const status = normalizeStatus(
        message.action,
        message.workflow_run?.conclusion
      )
      await bulkUpdateTfSvcInfra(
        db,
        trimWorkflowRun(message.workflow_run),
        status
      )
    } else {
      logger.info(
        'handling tf-svc-infra workflow completed message from non-main'
      )
      await handleGenericWorkflow(db, message)
    }
  } catch (e) {
    logger.error(e)
  }
}

const handleCdpCreateWorkflows = async (db, message) => {
  logger.info(`handling cdp-create-workflows message`)

  try {
    const repoName = message.workflow_run?.name // we repurpose the name to track name of repo its creating
    const updateStatus = updateRepositoryStatus(db, repoName)
    const status = findByRepoName(db, repoName)

    if (status !== null) {
      const workflowStatus = normalizeStatus(
        message.action,
        message.workflow_run?.conclusion
      )
      logger.info(
        `updating createRepository status fro ${repoName} to ${workflowStatus}`
      )

      await updateStatus({
        status: workflowStatus,
        'createRepository.status': workflowStatus
      })

      // TODO this is currently for create microservice only. When the create repository status comes in - update
      await updateOverallStatus(db, repoName)
    }
  } catch (e) {
    logger.error(e)
  }
}

const handleGenericWorkflow = async (db, message) => {
  try {
    const workflowRepo = message.repository?.name
    const headBranch = message.workflow_run?.head_branch
    const headSHA = message.workflow_run?.head_sha

    const status = await findByCommitHash(db, workflowRepo, headSHA)
    const serviceRepo = status?.repositoryName

    if (serviceRepo) {
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
    }
  } catch (e) {
    logger.error(e)
  }
}

export { workflowRunHandlerV2 }
