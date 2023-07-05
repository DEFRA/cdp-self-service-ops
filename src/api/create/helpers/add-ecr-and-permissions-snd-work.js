import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'
import { addRepoName } from '~/src/api/create/helpers/add-repo-name'
import { addRepoPermissions } from '~/src/api/create/helpers/add-repo-permissions'

async function addEcrAndPermissionsSndWork(repositoryName) {
  const fileRepository = appConfig.get('githubRepoTfServiceInfra')
  const sndEcrRepoNamesFilePath = 'snd/ecr_repo_names.json'

  const ecrRepoNamesData = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: sndEcrRepoNamesFilePath,
    ref: 'main'
  })

  const repositoryNamesJson = addRepoName({
    repositories: ecrRepoNamesData.data,
    fileRepository,
    filePath: sndEcrRepoNamesFilePath,
    repositoryName
  })

  const githubPermissionsFilePath = 'snd/github_oidc_repositories.json'
  const githubPermissionsData = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: githubPermissionsFilePath,
    ref: 'main'
  })

  const githubPermissionsJson = addRepoPermissions({
    permissions: githubPermissionsData.data,
    fileRepository,
    filePath: githubPermissionsFilePath,
    repositoryName,
    org: appConfig.get('gitHubOrg')
  })

  return [
    [sndEcrRepoNamesFilePath, repositoryNamesJson],
    [githubPermissionsFilePath, githubPermissionsJson]
  ]
}

export { addEcrAndPermissionsSndWork }
