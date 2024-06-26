import { config } from '~/src/config'
import { addRepoPermissions } from '~/src/api/create-microservice/helpers/add-repo-permissions'
import { getContent } from '~/src/helpers/gitHub/get-content'

async function addRepoToGithubOidc(repositoryName, env) {
  const org = config.get('gitHubOrg')
  const fileRepository = config.get('githubRepoTfServiceInfra')
  const filePath = `environments/${env}/resources/github_oidc_repositories.json`

  const data = await getContent(org, fileRepository, filePath)

  const githubPermissionsJson = addRepoPermissions({
    permissions: data,
    fileRepository,
    filePath,
    repositoryName,
    org
  })

  return [filePath, githubPermissionsJson]
}

export { addRepoToGithubOidc }
