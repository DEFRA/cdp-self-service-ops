import Boom from '@hapi/boom'
import { isUndefined } from 'lodash'

import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'

const existingServiceInfoController = {
  handler: async (request, h) => {
    const environment = request.params.environment
    const imageName = request.params.imageName

    try {
      const clusters = {}

      const frontendServices = await getClusterServices(environment, 'frontend')
      clusters.frontendService = frontendServices.find(
        (service) => service.container_image === imageName
      )

      if (!clusters.frontendService) {
        const backendServices = await getClusterServices(environment, 'backend')
        clusters.backendService = backendServices.find(
          (service) => service.container_image === imageName
        )
      }

      if (
        isUndefined(clusters.frontendService) &&
        isUndefined(clusters.backendService)
      ) {
        throw Boom.boomify(Boom.notFound(`Service ${imageName} not found`))
      }

      return h
        .response({
          message: 'success',
          existingServiceInfo:
            clusters.frontendService ?? clusters.backendService
        })
        .code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { existingServiceInfoController }
