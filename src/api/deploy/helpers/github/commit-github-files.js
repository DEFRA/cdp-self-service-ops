import { octokit } from '~/src/helpers/oktokit.js'

import { getLatestCommitSha } from '~/src/helpers/github/get-latest-commit-sha.js'

async function commitFiles(
  owner,
  repo,
  branch = `main`,
  commitMessage,
  content,
  logger
) {
  let startTime = Date.now()
  const commitSha = await getLatestCommitSha(owner, repo, branch)
  logger.info(`getLatestCommitSha: ${Date.now() - startTime}ms`)

  startTime = Date.now()
  const commitTreeSha = await getCommitTreeSha(owner, repo, commitSha)
  logger.info(`getCommitTreeSha: ${Date.now() - startTime}ms`)

  startTime = Date.now()
  const tree = await createDeploymentBlobTree(owner, repo, content)
  logger.info(`createDeploymentBlobTree: ${Date.now() - startTime}ms`)

  startTime = Date.now()
  const gitCommitTree = await createCommitTree(owner, repo, commitTreeSha, tree)
  logger.info(`createCommitTree: ${Date.now() - startTime}ms`)

  startTime = Date.now()
  const newCommit = await createNewCommit(
    owner,
    repo,
    commitMessage,
    gitCommitTree.sha,
    commitSha
  )
  logger.info(`createNewCommit: ${Date.now() - startTime}ms`)

  startTime = Date.now()
  const response = await setBranchToCommit(owner, repo, branch, newCommit.sha)
  logger.info(`setBranchToCommit: ${Date.now() - startTime}ms`)

  return response
}

async function getCommitTreeSha(owner, repo, commitSha) {
  const { data } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: commitSha
  })
  return data?.tree?.sha
}

async function createDeploymentBlobTree(owner, repo, content) {
  const tree = content.map(({ path, obj }) => {
    return createBlobs(owner, repo, obj).then((sha) => {
      return {
        path,
        mode: `100644`,
        type: `blob`,
        sha
      }
    })
  })

  return await Promise.all(tree)
}

async function createBlobs(owner, repo, content) {
  const utf8JsonString = JSON.stringify(content, null, 2)
  const { data } = await octokit.rest.git.createBlob({
    owner,
    repo,
    content: utf8JsonString,
    encoding: 'utf-8'
  })
  return data.sha
}

async function createCommitTree(owner, repo, baseTreeSha, tree) {
  const { data } = await octokit.rest.git.createTree({
    owner,
    repo,
    tree,
    base_tree: baseTreeSha
  })
  return data
}

async function createNewCommit(owner, repo, message, treeSha, commitSha) {
  const { data } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: treeSha,
    parents: [commitSha]
  })

  return data
}

async function setBranchToCommit(owner, repo, branch, commitSha) {
  const { data } = await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha
  })
  return data
}

export { commitFiles }
