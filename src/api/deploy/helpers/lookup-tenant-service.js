import { createLogger } from '~/src/helpers/logging/logger'
import { getContent } from '~/src/helpers/gitHub/get-content'
import { config } from '~/src/config'

async function lookupTenantService(environment, service) {
  const logger = createLogger()
  const filePath = `environments/${environment}/resources/tenant_services.json`
  const owner = config.get('gitHubOrg')
  const repo = config.get('githubRepoTfServiceInfra')

  try {
    const data = await getContent(owner, repo, filePath)
    const services = JSON.parse(data)
    return services[0][service]
  } catch (error) {
    logger.error(error)
    return undefined
  }
}

export { lookupTenantService }
