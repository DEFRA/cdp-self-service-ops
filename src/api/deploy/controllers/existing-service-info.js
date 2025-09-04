import { getServiceInfo } from '../helpers/get-service-info.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const existingServiceInfoController = {
  handler: async (request, h) => {
    const environment = request.params.environment
    const imageName = request.params.imageName

    const deployment = await getServiceInfo(
      imageName,
      environment,
      request.logger
    )

    return deployment
      ? h.response(deployment).code(statusCodes.ok)
      : h.response({ message: 'service not found' }).code(statusCodes.notFound)
  }
}

export { existingServiceInfoController }
