import { statusCodes } from '../../constants/status-codes.js'

const healthController = {
  handler: (request, h) => {
    return h.response({ message: 'success' }).code(statusCodes.ok)
  }
}

export { healthController }
