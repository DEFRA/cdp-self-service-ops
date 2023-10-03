import {
  findByCommitHash,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import {
  automerge,
  mergeOrAutomerge
} from '~/src/listeners/github/helpers/automerge'
import { updateCreationStatus } from '~/src/api/create/helpers/save-status'
import { triggerCreateRepositoryWorkflow } from '~/src/listeners/github/helpers/trigger-create-repository-workflow'
import { createLogger } from '~/src/helpers/logger'
import { setupDeploymentConfig } from '~/src/api/create/helpers/setup-deployment-config'
import { trimPr } from '~/src/api/create/helpers/trim-pr'

const logger = createLogger()

const workflowRunHandler = async (db, message) => {
  const owner = message.repository?.owner?.login
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
  if (
    repo === 'tf-svc-infra' &&
    message.action === 'completed' &&
    message.workflow_run?.conclusion === 'success'
  ) {
    logger.info(
      `triggering next steps in the creation of ${status.repositoryName}`
    )
    await triggerCreateRepositoryWorkflow(status.createRepository.payload)
    await updateCreationStatus(db, repo, 'createRepository', 'requested')

    // tf-svc needs the tf-svc-infra change to have completed before running in the terraform else it will fail
    const tfSvcResult = await setupDeploymentConfig(
      status.repositoryName,
      '0.1.0',
      status.zone
    )
    await updateCreationStatus(db, status.repositoryName, 'tf-svc', {
      status: 'raised',
      pr: trimPr(tfSvcResult?.data)
    })
    logger.info(
      `created deployment PR for ${status.repositoryName}: ${tfSvcResult.data.html_url}`
    )
    await automerge(tfSvcResult.data.pr.number)

    await mergeOrAutomerge(owner, 'cdp-app-config', status['cdp-app-config'].pr)

    await mergeOrAutomerge(
      owner,
      'cdp-nginx-upstreams',
      status['cdp-nginx-upstreams'].pr
    )
  }

  // Record what happened
  const workflowStatus = message.workflow_run?.conclusion ?? message.action
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
