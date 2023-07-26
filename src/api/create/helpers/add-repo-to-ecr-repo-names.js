import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'
import { addRepoName } from '~/src/api/create/helpers/add-repo-name'
import { createLogger } from '~/src/helpers/logger'

async function addRepoToEcrRepoNames(repositoryName, environment) {
  const logger = createLogger()
  const fileRepository = appConfig.get('githubRepoTfServiceInfra')
  const filePath = `environments/${environment}/resources/tenant_services.json`

  try {
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
  } catch (error) {
    logger.error(error)
    return []
  }
}

export { addRepoToEcrRepoNames }
