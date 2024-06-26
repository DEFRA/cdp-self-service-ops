import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'
import { getContent } from '~/src/helpers/gitHub/get-content'

async function addRepoToTenantServices(repositoryName, environment, zone) {
  const logger = createLogger()
  const owner = config.get('gitHubOrg')
  const fileRepository = config.get('githubRepoTfServiceInfra')
  const filePath = `environments/${environment}/resources/tenant_services.json`

  try {
    const data = await getContent(owner, fileRepository, filePath)
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
