import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'
import { addRepoName } from '~/src/api/create/helpers/add-repo-name'

async function addRepoToEcrRepoNames(repositoryName, environment) {
  const fileRepository = appConfig.get('githubRepoTfServiceInfra')
  const filePath = `environments/${environment}/resources/ecr_repo_names.json`

  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: filePath,
    ref: 'main'
  })

  const repositoryNamesJson = addRepoName({
    repositories: data,
    fileRepository,
    filePath,
    repositoryName
  })

  return [filePath, repositoryNamesJson]
}

export { addRepoToEcrRepoNames }
