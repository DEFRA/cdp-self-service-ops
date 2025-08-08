import { getServiceInfo } from '../helpers/get-service-info.js'
import { statusCodes } from '../../../constants/status-codes.js'

const existingServiceInfoController = {
  handler: async (request, h) => {
    const environment = request.params.environment
    const imageName = request.params.imageName

    const deployment = await getServiceInfo(
      imageName,
      environment,
      request.logger
    )

    const message = deployment ? 'success' : 'service not found'
    const responseCode = deployment ? statusCodes : statusCodes.notFound
    return h
      .response({
        message,
        ...(deployment && { deployment })
      })
      .code(responseCode)
  }
}

export { existingServiceInfoController }
