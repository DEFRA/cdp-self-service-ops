import { getLatestCommitSha } from '~/src/helpers/github/get-latest-commit-sha.js'
import { graphql } from '~/src/helpers/oktokit.js'

/**
 * @param {{owner: string, repo: string, branch: string, commitMessage: string, filePath: string, content: object, logger: import('pino').Logger}} options
 * @returns {Promise<{object}>}
 */
async function commitFile({
  owner,
  repo,
  branch = `main`,
  commitMessage,
  filePath,
  content,
  logger
}) {
  let startTime = Date.now()
  const commitSha = await getLatestCommitSha(owner, repo, branch)
  logger.info(`getLatestCommitSha: ${Date.now() - startTime}ms`)

  startTime = Date.now()
  const response = await createNewCommit(
    owner,
    repo,
    branch,
    commitSha,
    commitMessage,
    filePath,
    content
  )
  logger.info(`createNewCommit: ${Date.now() - startTime}ms`)

  return response
}

async function createNewCommit(
  owner,
  repo,
  branch,
  commitSha,
  commitMessage,
  filePath,
  content
) {
  const utf8JsonString = JSON.stringify(content, null, 2)

  return await graphql(
    `
    mutation m1 {
      createCommitOnBranch(
                input: {
                branch: {
                    repositoryNameWithOwner: "${owner}/${repo}",
                    branchName: "${branch}"
                },
                message: {
                    headline: "${commitMessage}"
                },
                fileChanges: {
                    additions: [
                        {
                            path: "${filePath}",
                            contents: "${Buffer.from(utf8JsonString).toString('base64')}"
                        }
                    ]
                },
                expectedHeadOid: "${commitSha}"
            }
      ) {
        clientMutationId
      }
    }
  `
  )
}

export { commitFile }
