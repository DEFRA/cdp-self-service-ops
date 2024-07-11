import {
  findByPrNumber,
  updatePrStatus
} from '~/src/listeners/github/status-repo'
import { createLogger } from '~/src/helpers/logging/logger'

const pullRequestHandler = async (db, message) => {
  const logger = createLogger()
  try {
    const repo = message.repository?.name
    const prNumber = message.number

    logger.info(
      `Received pr webhook ${repo}:${prNumber}, ${message.action} ${message.pull_request.state} ${message.pull_request.merged}`
    )

    // Ignore PR events that are not opened or closed.
    if (message.action !== 'opened' && message.action !== 'closed') {
      logger.info(
        `Ignoring pull request action ${message.action} for ${repo} ${prNumber}`
      )
      return
    }

    const status = await findByPrNumber(db, repo, prNumber)
    if (status === null) {
      logger.info(
        `Skipping pull request message, not a tracked repo ${repo} ${prNumber}`
      )
      return
    }

    // Note: we append `pr_` to the front of the status (i.e. pr_closed).
    let prState = `pr_${message.pull_request.state}`

    // Merged pull requests have a state of closed and a merged flag
    if (message.pull_request.merged) {
      prState = 'merged'
    }

    logger.info(
      `Updating ${repo}/${prNumber} status to ${prState} head commit sha to ${message.pull_request.merge_commit_sha}`
    )

    await updatePrStatus(
      db,
      status.repositoryName,
      repo,
      prState,
      message.pull_request.merge_commit_sha
    )
  } catch (e) {
    logger.error(e)
  }
}

export { pullRequestHandler }
