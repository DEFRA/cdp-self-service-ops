import {
  findByCommitHash,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import { mergeOrAutomerge } from '~/src/listeners/github/helpers/automerge'
import { updateCreationStatus } from '~/src/api/create/helpers/save-status'
import { triggerCreateRepositoryWorkflow } from '~/src/listeners/github/helpers/trigger-create-repository-workflow'
import { createLogger } from '~/src/helpers/logger'

const logger = createLogger()

const workflowRunHandler = async (db, message) => {
  const owner = message.repository?.owner.login
  const repo = message.repository?.name
  const headBranch = message.workflow_run?.head_branch
  const headSHA = message.workflow_run?.head_sha

  logger.info(
    `processing workflow_run message for ${repo}, ${headBranch} ${headSHA}`
  )

  if (headBranch !== 'main') {
    // ignore PR validators
    return
  }

  const status = await findByCommitHash(db, repo, headSHA)
  if (status === null) {
    logger.info(
      `skipping workflow_run, not a tracked commit ${repo} ${headSHA}`
    )
    return
  }

  // TODO: check which workflow job was run, we only want to react to one's we know about
  // its unclear how to consistently identify the workflows, other than by path or name?

  // We only need to trigger more steps on tf-svc-infra since this gate-keeps the ECR repo etc
  if (repo === 'tf-svc-infra' && message.action === 'completed') {
    logger.info(
      `triggering next steps in the creation of ${status.repositoryName}`
    )
    await triggerCreateRepositoryWorkflow(status.createRepository.payload)
    await updateCreationStatus(db, repo, 'createRepository', 'requested')

    await mergeOrAutomerge(owner, 'cdp-app-config', status['cdp-app-config'].pr)
    await mergeOrAutomerge(owner, 'tf-svc', status['tf-svc'].pr)
    await mergeOrAutomerge(
      owner,
      'cdp-nginx-upstreams',
      status['cdp-nginx-upstreams'].pr
    )
  }

  // Record what happened
  const workflowStatus = `workflow_${message.action}`
  logger.info(
    `updating status for creation job ${status.repositoryName} ${repo}:${workflowStatus}`
  )
  await updateWorkflowStatus(
    db,
    status.repositoryName,
    repo,
    workflowStatus,
    trimWorkflowRun(message.workflow_run)
  )
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

export { workflowRunHandler }
