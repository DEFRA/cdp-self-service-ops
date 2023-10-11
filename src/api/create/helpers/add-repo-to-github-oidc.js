import { octokit } from '~/src/helpers/oktokit'
import { config } from '~/src/config'
import { addRepoPermissions } from '~/src/api/create/helpers/add-repo-permissions'

async function addRepoToGithubOidc(repositoryName, env) {
  const fileRepository = config.get('githubRepoTfServiceInfra')
  const filePath = `environments/${env}/resources/github_oidc_repositories.json`

  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: config.get('gitHubOrg'),
    repo: fileRepository,
    path: filePath,
    ref: 'main'
  })

  const githubPermissionsJson = addRepoPermissions({
    permissions: data,
    fileRepository,
    filePath,
    repositoryName,
    org: config.get('gitHubOrg')
  })

  return [filePath, githubPermissionsJson]
}

export { addRepoToGithubOidc }
