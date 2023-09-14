import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'
import { appConfig } from '~/src/config'

const deployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [appConfig.get('azureAdminGroupId'), '{params.teamId}']
      }
    },
    validate: {
      payload: deployServiceValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    await createDeploymentPullRequest(request.payload)

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
