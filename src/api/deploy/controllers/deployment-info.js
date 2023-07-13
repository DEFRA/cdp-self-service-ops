import Boom from '@hapi/boom'
import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'

const deploymentInfoController = {
  options: {},
  handler: async (request, h) => {
    const env = request.params.env

    try {
      const frontendServices = await getClusterServices(env, 'frontend')
      const backendServices = await getClusterServices(env, 'backend')

      return h
        .response({
          frontends: frontendServices,
          backends: backendServices
        })
        .code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { deploymentInfoController }
