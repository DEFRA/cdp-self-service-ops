import { getLatestCommitSha } from '~/src/helpers/github/get-latest-commit-sha.js'
import { graphql } from '~/src/helpers/oktokit-graphql.js'

async function deleteGithubFile(
  owner,
  repo,
  branch = `main`,
  commitMessage,
  filePath,
  logger
) {
  let startTime = Date.now()
  const commitSha = await getLatestCommitSha(owner, repo, branch)
  logger.info(`getLatestCommitSha: ${Date.now() - startTime}ms`)

  startTime = Date.now()

  const response = await graphql(
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
                    deletions: [
                        {
                            path: "${filePath}"
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

  logger.info(`createNewCommit: ${Date.now() - startTime}ms`)

  return response
}

export { deleteGithubFile }
