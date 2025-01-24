import { config } from '~/src/config/index.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { getExistingDeployment } from '~/src/api/deploy/helpers/get-existing-deployment.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

const existingServiceInfoController = {
  handler: async (request, h) => {
    const environment = request.params.environment
    const imageName = request.params.imageName

    const service = await lookupTenantService(
      imageName,
      environment,
      request.logger
    )

    const filePath = `environments/${environment}/${service?.zone}/${imageName}.json`

    const deployment = await getExistingDeployment(
      gitHubOwner,
      deploymentRepo,
      filePath
    )

    const message = deployment ? 'success' : 'service not found'
    const responseCode = deployment ? 200 : 404
    return h
      .response({
        message,
        ...(deployment && { deployment })
      })
      .code(responseCode)
  }
}

export { existingServiceInfoController }
