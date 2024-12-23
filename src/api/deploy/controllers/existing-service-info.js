import { config } from '~/src/config/index.js'
import { getContent } from '~/src/helpers/github/get-content.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'

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

async function getExistingDeployment(owner, repo, filePath) {
  try {
    const data = await getContent(owner, repo, filePath)
    return JSON.parse(data)
  } catch (error) {
    if (error.status === 404) {
      return null
    }
    throw error
  }
}

export { existingServiceInfoController }
