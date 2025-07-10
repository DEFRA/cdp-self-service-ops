import { getLatestCommitSha } from '~/src/helpers/github/get-latest-commit-sha.js'
import { graphql } from '~/src/helpers/oktokit/oktokit.js'

/**
 *
 * @template T
 * @param {import('pino').Logger} logger
 * @param {() => Promise<T>} fn
 * @param {number} retries
 * @param {number} delayMs
 * @param {(error: any) => boolean} shouldRetry
 * @returns {Promise<T>}
 * @throws Will throw the last encountered error if retries are exhausted or shouldRetry returns false.
 */
async function retry(
  logger,
  fn,
  retries = 3,
  delayMs = 1000,
  shouldRetry = () => true
) {
  try {
    return await fn()
  } catch (err) {
    logger.error(err)
    if (retries <= 0 || !shouldRetry(err)) throw err
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return retry(logger, fn, retries - 1, delayMs, shouldRetry)
  }
}

/**
 * @returns {Promise<{object}>}
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @param {string} commitMessage
 * @param {string} filePath
 * @param {object} content
 * @param {import("pino").Logger} logger
 */
async function commitFile(
  owner,
  repo,
  branch,
  commitMessage,
  filePath,
  content,
  logger
) {
  await retry(logger, async () => {
    let startTime = Date.now()
    const commitSha = await getLatestCommitSha(owner, repo, branch)
    logger.info(
      `getLatestCommitSha: ${commitSha} in ${Date.now() - startTime}ms`
    )

    startTime = Date.now()
    const response = await createNewCommit(
      owner,
      repo,
      branch,
      commitSha,
      commitMessage,
      filePath,
      content,
      logger
    )
    logger.info(`createNewCommit: ${Date.now() - startTime}ms`)

    return response
  })
}

async function createNewCommit(
  owner,
  repo,
  branch,
  commitSha,
  commitMessage,
  filePath,
  content,
  logger
) {
  const utf8JsonString = JSON.stringify(content, null, 2)
  try {
    return await graphql(
      `
        mutation m1($input: CreateCommitOnBranchInput!) {
          createCommitOnBranch(input: $input) {
            clientMutationId
          }
        }
      `,
      {
        input: {
          branch: {
            repositoryNameWithOwner: `${owner}/${repo}`,
            branchName: branch
          },
          message: {
            headline: commitMessage
          },
          fileChanges: {
            additions: [
              {
                path: filePath,
                contents: Buffer.from(utf8JsonString).toString('base64')
              }
            ]
          },
          expectedHeadOid: commitSha
        }
      }
    )
  } catch (error) {
    logger.error(error, `Error creating commit: ${error.message}`)
    throw error
  }
}

export { commitFile, retry }
