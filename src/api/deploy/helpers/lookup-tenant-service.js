import { createLogger } from '~/src/helpers/logging/logger'
import { getContent } from '~/src/helpers/github/get-content'
import { config } from '~/src/config'

async function lookupTenantService(service, environment) {
  const logger = createLogger()
  const filePath = `environments/${environment}/resources/tenant_services.json`
  const owner = config.get('gitHubOrg')
  const repo = config.get('gitHubRepoTfServiceInfra')

  try {
    const data = await getContent(owner, repo, filePath)
    const services = JSON.parse(data)
    return services[0][service]
  } catch (error) {
    logger.error(error, `Error attempting to retrieve ${filePath} from GitHub`)
    return undefined
  }
}

export { lookupTenantService }
