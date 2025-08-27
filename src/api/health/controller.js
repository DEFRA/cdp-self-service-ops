import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const healthController = {
  handler: (request, h) => {
    return h.response({ message: 'success' }).code(statusCodes.ok)
  }
}

export { healthController }
