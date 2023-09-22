import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'
import { createLogger } from '~/src/helpers/logger'

const logger = createLogger()

const automerge = async (pullId) => {
  await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: pullId
  })
}

const mergeOrAutomerge = async (owner, repo, pr) => {
  logger.info(`attempting to merge ${owner}/${repo} ${pr.number}`)

  const canMerge = await octokit.rest.pulls.merge({
    owner,
    repo,
    pull_number: pr.number
  })
  if (!canMerge.data.merged) {
    // attempt to enable auto-merge instead
    logger.info('merge refused, trying to automerge')
    await automerge(pr.node_id)
  }
}

export { automerge, mergeOrAutomerge }
