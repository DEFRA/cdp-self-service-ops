import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'
import { createLogger } from '~/src/helpers/logger'

const automerge = async (pullId) => {
  const logger = createLogger()
  try {
    return await octokit.graphql(enableAutoMergeGraphQl, {
      pullRequestId: pullId
    })
  } catch (e) {
    logger.info(`Failed to enable auto-merge on ${pullId}: ${e}`)
  }
}

const mergeOrAutomerge = async (owner, repo, pr) => {
  const logger = createLogger()
  logger.info(`Attempting to merge ${owner}/${repo} ${pr.number} ${pr.node_id}`)

  let merged = false
  try {
    const canMerge = await octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: pr.number
    })
    merged = canMerge.data.merged
  } catch (e) {
    logger.info(`Merge refused for ${pr.html_url} ,${e}`)
  }

  if (!merged) {
    // attempt to enable auto-merge instead
    try {
      logger.info(
        `Merge refused, trying to auto-merge ${owner}/${repo} ${pr.node_id}`
      )
      const autoMergeResponse = await automerge(pr.node_id)
      logger.info(`Auto-merge response ${autoMergeResponse}`)
    } catch (e) {
      logger.info(`Failed to merge ${pr.html_url} ${e}`)
    }
  }
}
export { automerge, mergeOrAutomerge }
