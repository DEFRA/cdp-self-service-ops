import { createLogger } from '~/src/helpers/logging/logger'
import { updateSubStatus } from '~/src/helpers/db/status/update-sub-status'
import { findByPrNumber } from '~/src/helpers/db/status/find-by-pr-number'

const pullRequestHandler = async (db, message) => {
  const logger = createLogger()
  try {
    const prRepo = message.repository?.name
    const prNumber = message.number

    const status = await findByPrNumber(db, prRepo, prNumber)
    if (status === null) {
      logger.debug(
        `Skipping pull request message, not a tracked repo ${prRepo} ${prNumber}`
      )
      return
    }

    logger.info(`Processing pull request message for ${prRepo}:${prNumber}`)

    // State of this Pull Request. message.pull_request.state Can be one of: open, closed
    // https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request
    let prState = `pr_${message.pull_request.state}`
    if (message.pull_request.merged) {
      logger.info(
        `Updating ${status.repositoryName}/${prRepo} head commit sha to ${message.pull_request.merge_commit_sha}`
      )
      prState = 'merged'
    }

    await updateSubStatus(db, status.repositoryName, prRepo, prState, {
      merged_sha: message.pull_request.merge_commit_sha
    })
  } catch (e) {
    logger.error(e)
  }
}

export { pullRequestHandler }
