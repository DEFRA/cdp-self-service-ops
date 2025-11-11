import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { getExistingDeployment } from './get-existing-deployment.js'
import { config } from '../../../config/index.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

async function getServiceInfo(serviceName, environment, logger) {
  const entity = await getEntity(serviceName, environment, logger)
  const zone = entity.environments[environment]?.tenant_config?.zone
  const filePath = `environments/${environment}/${zone}/${serviceName}.json`

  return await getExistingDeployment(gitHubOwner, deploymentRepo, filePath)
}

export { getServiceInfo }
