import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { getExistingDeployment } from '~/src/api/deploy/helpers/get-existing-deployment.js'
import { config } from '~/src/config/index.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

async function getServiceInfo(serviceName, environment, logger) {
  const service = await lookupTenantService(serviceName, environment, logger)

  const filePath = `environments/${environment}/${service?.zone}/${serviceName}.json`

  const deployment = await getExistingDeployment(
    gitHubOwner,
    deploymentRepo,
    filePath
  )

  return deployment
}

export { getServiceInfo }
