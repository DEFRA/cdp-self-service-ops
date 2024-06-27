import { octokit } from '~/src/helpers/oktokit'

async function getContent(owner, repo, filePath, ref = 'main') {
  const { data } = await octokit.rest.repos.getContent({
    mediaType: { format: 'raw' },
    owner,
    repo,
    path: filePath,
    ref
  })
  return data
}

export { getContent }
