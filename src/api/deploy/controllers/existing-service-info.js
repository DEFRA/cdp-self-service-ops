import Boom from '@hapi/boom'
import { isUndefined } from 'lodash'

import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'

const existingServiceInfoController = {
  handler: async (request, h) => {
    const environment = request.params.environment
    const imageName = request.params.imageName

    try {
      const clusters = {}

      const publicServices = await getClusterServices(environment, 'public')
      clusters.publicService = publicServices.find(
        (service) => service.container_image === imageName
      )

      if (!clusters.publicService) {
        const protectedServices = await getClusterServices(
          environment,
          'protected'
        )
        clusters.protectedService = protectedServices.find(
          (service) => service.container_image === imageName
        )
      }

      if (
        isUndefined(clusters.publicService) &&
        isUndefined(clusters.protectedService)
      ) {
        throw Boom.boomify(Boom.notFound(`Service ${imageName} not found`))
      }

      return h
        .response({
          message: 'success',
          existingServiceInfo:
            clusters.publicService ?? clusters.protectedService
        })
        .code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { existingServiceInfoController }
