import { lookupTenantService } from '../../../helpers/portal-backend/lookup-tenant-service.js'
import { getExistingDeployment } from './get-existing-deployment.js'
import { config } from '../../../config/index.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

async function getServiceInfo(serviceName, environment, logger) {
  const service = await lookupTenantService(serviceName, environment, logger)

  const filePath = `environments/${environment}/${service?.zone}/${serviceName}.json`

  return await getExistingDeployment(gitHubOwner, deploymentRepo, filePath)
}

export { getServiceInfo }
