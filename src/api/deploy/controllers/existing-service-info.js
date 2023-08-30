import Boom from '@hapi/boom'
import { isUndefined } from 'lodash'

import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'

const existingServiceInfoController = {
  handler: async (request, h) => {
    const environment = request.params.environment
    const imageName = request.params.imageName

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
      throw Boom.notFound(`Service ${imageName} not found`)
    }

    return h
      .response({
        message: 'success',
        serviceInfo: clusters.publicService ?? clusters.protectedService
      })
      .code(200)
  }
}

export { existingServiceInfoController }
