import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'
import { createLogger } from '~/src/helpers/logger'

const logger = createLogger()

const automerge = async (pullId) => {
  logger.info(`automerging id ${pullId}`)
  return await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: pullId
  })
}

const mergeOrAutomerge = async (owner, repo, pr) => {
  logger.info(`attempting to merge ${owner}/${repo} ${pr.number} ${pr.node_id}`)

  let merged = false
  try {
    const canMerge = await octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: pr.number
    })
    merged = canMerge.data.merged
  } catch (e) {
    logger.info(`Failed to auto-merge ${e}`)
  }

  if (!merged) {
    // attempt to enable auto-merge instead
    try {
      logger.info('merge refused, trying to automerge')
      const autoMergeResponse = await automerge(pr.node_id)
      logger.info(autoMergeResponse)
    } catch (e) {
      logger.info(`failed to auto-merge: ${e}`)
    }
  }
}
export { automerge, mergeOrAutomerge }
