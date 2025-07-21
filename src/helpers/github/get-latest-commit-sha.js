import { octokit } from '../oktokit/oktokit.js'

async function getLatestCommitSha(owner, repo, branch = 'main') {
  const { data } = await octokit.rest.git.getRef({
    mediaType: {
      format: 'raw'
    },
    owner,
    repo,
    ref: `heads/${branch}`
  })
  return data?.object?.sha
}

export { getLatestCommitSha }
