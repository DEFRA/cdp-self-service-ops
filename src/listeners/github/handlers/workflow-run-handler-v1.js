import {
  findByCommitHash,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import { mergeOrAutomerge } from '~/src/listeners/github/helpers/automerge'
import { updateCreationStatus } from '~/src/api/create/helpers/save-status'
import { triggerCreateRepositoryWorkflow } from '~/src/listeners/github/helpers/trigger-create-repository-workflow'
import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'
import { createPlaceholderArtifact } from '~/src/listeners/github/helpers/createPlaceholderArtifact'

const tfSvcInfra = config.get('githubRepoTfServiceInfra')
const cdpAppConfig = config.get('githubRepoConfig')
const cdpNginxUpstreams = config.get('githubRepoNginx')

const workflowRunHandlerV1 = async (db, message) => {
  const logger = createLogger()
  try {
    const owner = message.repository?.owner?.login
    const repo = message.repository?.name
    const headBranch = message.workflow_run?.head_branch
    const headSHA = message.workflow_run?.head_sha

    if (headBranch !== 'main') {
      // ignore PR validators
      return
    }

    logger.info(
      `processing workflow_run message for ${repo}, ${headBranch}/${headSHA}, action: ${message.action}`
    )

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
    // Old style orchestration, to be deleted when v2 is the norm
    if (
      repo === tfSvcInfra &&
      message.action === 'completed' &&
      message.workflow_run?.conclusion === 'success' &&
      status.portalVersion !== 2 // ignore the new create-a-service system
    ) {
      logger.info(
        `triggering next steps in the creation of ${status.repositoryName}`
      )

      if (status.createRepository.status === 'not-requested') {
        logger.info(`triggering creation of repo ${status.repositoryName}`)
        const createRepoResult = await triggerCreateRepositoryWorkflow(
          status.createRepository.payload
        )
        logger.info(`creation of repo ${status.repositoryName} triggered`)
        await updateCreationStatus(
          db,
          status.repositoryName,
          'createRepository',
          {
            status: 'success',
            payload: status.payload,
            job: createRepoResult
          }
        )
        await createPlaceholderArtifact({
          service: status.repositoryName,
          githubUrl: `https://github.com/${owner}/${status.repositoryName}`
        })
      }

      await mergeOrAutomerge(owner, cdpAppConfig, status[cdpAppConfig].pr)

      await mergeOrAutomerge(
        owner,
        cdpNginxUpstreams,
        status[cdpNginxUpstreams].pr
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
      'main', // we're not processing PR workflows in the v1 handler
      workflowStatus,
      trimWorkflowRun(message.workflow_run)
    )
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

export { workflowRunHandlerV1 }
