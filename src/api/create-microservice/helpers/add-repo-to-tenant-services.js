import { octokit } from '~/src/helpers/oktokit'
import { config } from '~/src/config'
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

    const parsedRepositories = JSON.parse(data)

    if (parsedRepositories[0][repositoryName] === undefined) {
      parsedRepositories[0][repositoryName] = {
        zone,
        mongo: zone === 'protected',
        redis: zone === 'public'
      }
    } else {
      logger.warn(
        `There's already and entry for '${repositoryName} in cdp-tf-svc-infra! We wont overwrite it.`
      )
    }

    const repositoryNamesJson = JSON.stringify(parsedRepositories, null, 2)

    return [filePath, repositoryNamesJson]
  } catch (error) {
    logger.error(error)
    return []
  }
}

export { addRepoToTenantServices }
