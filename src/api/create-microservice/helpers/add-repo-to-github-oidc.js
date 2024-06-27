import { config } from '~/src/config'
import { addRepoPermissions } from '~/src/api/create-microservice/helpers/add-repo-permissions'
import { getContent } from '~/src/helpers/github/get-content'

async function addRepoToGitHubOidc(repositoryName, env) {
  const org = config.get('gitHubOrg')
  const fileRepository = config.get('gitHubRepoTfServiceInfra')
  const filePath = `environments/${env}/resources/github_oidc_repositories.json`

  const data = await getContent(org, fileRepository, filePath)

  const gitHubPermissionsJson = addRepoPermissions({
    permissions: data,
    fileRepository,
    filePath,
    repositoryName,
    org
  })

  return [filePath, gitHubPermissionsJson]
}

export { addRepoToGitHubOidc }
