import { octokit } from '~/src/helpers/oktokit'
import { config } from '~/src/config'
import { addRepoName } from '~/src/api/createV2/helpers/add-repo-name'
import { createLogger } from '~/src/helpers/logging/logger'

async function addRepoToTenantServices(repositoryName, environment, zone) {
  const logger = createLogger()
  const fileRepository = config.get('githubRepoTfServiceInfra')
  const filePath = `environments/${environment}/resources/tenant_services.json`

  try {
    const { data } = await octokit.rest.repos.getContent({
      mediaType: {
        format: 'raw'
      },
      owner: config.get('gitHubOrg'),
      repo: fileRepository,
      path: filePath,
      ref: 'main'
    })

    const repositoryNamesJson = addRepoName({
      repositories: data,
      fileRepository,
      filePath,
      repositoryName,
      zone
    })

    return [filePath, repositoryNamesJson]
  } catch (error) {
    logger.error(error)
    return []
  }
}

export { addRepoToTenantServices }
