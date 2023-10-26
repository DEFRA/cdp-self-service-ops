const { findByCommitHash } = require('~/src/listeners/github/status-repo')
const {
  workflowRunHandlerV2
} = require('~/src/listeners/github/handlers/workflow-run-handler-v2')
const { createLogger } = require('~/src/helpers/logging/logger')
const {
  workflowRunHandlerV1
} = require('~/src/listeners/github/handlers/workflow-run-handler-v1')

const workflowRunHandler = async (db, message) => {
  const logger = createLogger()
  try {
    const repo = message.repository?.name
    const headBranch = message.workflow_run?.head_branch
    const headSHA = message.workflow_run?.head_sha

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

    if (status.portalVersion === 2) {
      return await workflowRunHandlerV2(db, message)
    } else {
      return await workflowRunHandlerV1(db, message)
    }
  } catch (e) {
    logger.error(e)
  }
}

export { workflowRunHandler }
