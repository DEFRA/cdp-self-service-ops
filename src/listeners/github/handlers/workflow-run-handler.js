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
    if (
      repo === 'tf-svc-infra' &&
      message.action === 'completed' &&
      message.workflow_run?.conclusion === 'success'
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
            status: 'raised',
            payload: status.payload,
            job: createRepoResult
          }
        )
      }

      // tf-svc needs the tf-svc-infra change to have completed before running in the terraform else it will fail
      if (status['tf-svc'].status === 'not-requested') {
        try {
          const tfSvcPR = await setupDeploymentConfig(
            status.repositoryName,
            '0.1.0',
            status.zone
          )
          logger.info(
            `created tf-svc deployment PR for ${status.repositoryName}: ${tfSvcPR.data.html_url}`
          )
          await updateCreationStatus(db, status.repositoryName, 'tf-svc', {
            status: 'raised',
            pr: trimPr(tfSvcPR?.data)
          })
          logger.info(
            `auto-merging tf-svc PR for ${status.repositoryName}: ${tfSvcPR.data.html_url}`
          )
          const autoMergeResult = await automerge(tfSvcPR?.data?.node_id)
          logger.info(autoMergeResult)
        } catch (err) {
          logger.info(
            `Failed to raise/automerge tf-svc pull request for ${status.repositoryName}`
          )
          logger.info(err)
          await updateCreationStatus(
            db,
            status.repositoryName,
            'tf-svc.status',
            'failed'
          )
        }
      }

      logger.info(`auto-merging `)
      await mergeOrAutomerge(
        owner,
        'cdp-app-config',
        status['cdp-app-config'].pr
      )

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

export { workflowRunHandler }
