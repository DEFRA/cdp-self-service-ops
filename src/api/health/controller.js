import { statusCodes } from '@defra/cdp-validation-kit'

const healthController = {
  handler: (request, h) => {
    return h.response({ message: 'success' }).code(statusCodes.ok)
  }
}

export { healthController }
