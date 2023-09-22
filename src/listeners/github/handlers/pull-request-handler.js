import {
  findByPrNumber,
  updatePrStatus
} from '~/src/listeners/github/status-repo'
import { createLogger } from '~/src/helpers/logger'

const logger = createLogger()

const pullRequestHandler = async (db, message) => {
  const repo = message.repository?.name
  const prNumber = message.number

  logger.info(`processing pull request message for ${repo}:${prNumber}`)

  const status = await findByPrNumber(db, repo, prNumber)
  if (status === null) {
    logger.debug(
      `skipping pull request message, not a tracked repo ${repo} ${prNumber}`
    )
    return
  }

  let prState = `pr_${message.pull_request.state}`
  if (message.pull_request.merged) {
    logger.info(`updating sha to ${message.pull_request.merge_commit_sha}`)
    prState = 'merged'
  }
  await updatePrStatus(
    db,
    status.repositoryName,
    repo,
    prState,
    message.pull_request.merge_commit_sha
  )
}

export { pullRequestHandler }
