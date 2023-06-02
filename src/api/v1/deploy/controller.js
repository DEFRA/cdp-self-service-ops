import { deployServicePayloadSchema } from './helpers/deploy-service-payload-validation'
import { createDeploymentPullRequest } from './helpers/create-deployment-pull-request'
import { fetchGithubFileRaw } from './helpers/fetch-github-file-raw'

const deployServiceController = {
  options: {
    validate: {
      payload: deployServicePayloadSchema()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    try {
      // TODO: get cluster name from request
      const cluster = await detectCluster('snd', request.payload.imageName)

      h.request.logger.info(
        `Deploying ${request.payload.imageName}:${request.payload.version} to ${cluster}`
      )
      await createDeploymentPullRequest(
        request.payload.imageName,
        request.payload.version,
        cluster
      )
      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      h.request.logger.error(error)

      return h
        .response({
          message: error?.message
        })
        .code(error?.status)
    }
  }
}

const detectCluster = async (env, imageName) => {
  const backends = await fetchGithubFileRaw(env + '/backend_services.json')
  const frontends = await fetchGithubFileRaw(env + '/frontend_services.json')

  if (backends.find((i) => i.container_image === imageName)) {
    return 'backend'
  }

  if (frontends.find((i) => i.container_image === imageName)) {
    return 'frontend'
  }

  throw new Error(
    `Unable to determin which cluster to deploy ${imageName} belongs to.`
  )
}

export { deployServiceController }
