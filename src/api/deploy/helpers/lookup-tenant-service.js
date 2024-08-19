import { getContent } from '~/src/helpers/github/get-content'
import { config } from '~/src/config'

async function lookupTenantService(service, environment, logger) {
  const filePath = `environments/${environment}/tenants/${service}.json`
  const owner = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')

  try {
    const data = await getContent(owner, repo, filePath)
    const service = JSON.parse(data)

    if (service?.zone && service?.service_code) {
      return service
    } else {
      logger.warn(
        `${service}.json did not contain zone and service_code - Falling back to tenant_services.json`
      )
      return await lookupTenantServices(
        service,
        environment,
        owner,
        repo,
        logger
      )
    }
  } catch (error) {
    logger.error(
      error,
      `Error attempting to retrieve ${filePath} from GitHub - Falling back to tenant_services.json`
    )
    return await lookupTenantServices(service, environment, owner, repo, logger)
  }
}

async function lookupTenantServices(service, environment, owner, repo, logger) {
  const filePath = `environments/${environment}/resources/tenant_services.json`
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
