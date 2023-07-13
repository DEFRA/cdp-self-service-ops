import Boom from '@hapi/boom'
import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'

const deploymentInfoForServiceController = {
  options: {},
  handler: async (request, h) => {
    const env = request.params.env
    const service = request.params.service

    try {
      // TODO: cache these results in redis etc instead of polling them every time
      const backendServices = await getClusterServices(env, 'backend')
      let res = backendServices.find((s) => s.container_image === service)

      if (!res) {
        const frontendServices = await getClusterServices(env, 'frontend')
        res = frontendServices.find((s) => s.container_image === service)
      }

      if (!res) {
        return h
          .response({ message: `service ${service} was not found` })
          .code(404)
      }

      return h.response(res).code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { deploymentInfoForServiceController }
