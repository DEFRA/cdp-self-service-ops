import { createLogger } from '~/src/helpers/logging/logger'
import { getContent } from '~/src/helpers/github/get-content'
import { config } from '~/src/config'

async function lookupTenantServicesForCommit(environment, sha) {
  const logger = createLogger()
  const filePath = `environments/${environment}/resources/tenant_services.json`
  const owner = config.get('github.org')
  const repo = config.get('gitHubRepoTfServiceInfra')

  try {
    const data = await getContent(owner, repo, filePath, sha)
    const services = JSON.parse(data)

    return services[0]
  } catch (error) {
    logger.error(error)
    return undefined
  }
}

export { lookupTenantServicesForCommit }
