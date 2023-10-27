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

    const status = await findByPrNumber(db, repo, prNumber)
    if (status === null) {
      logger.debug(
        `Skipping pull request message, not a tracked repo ${repo} ${prNumber}`
      )
      return
    }

    logger.info(`Processing pull request message for ${repo}:${prNumber}`)

    // State of this Pull Request. message.pull_request.state Can be one of: open, closed
    // https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request
    let prState = `pr_${message.pull_request.state}`
    if (message.pull_request.merged) {
      logger.info(
        `Updating ${status.repositoryName}/${repo} head commit sha to ${message.pull_request.merge_commit_sha}`
      )
      prState = 'merged'
    }
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
