import { config } from '../config/index.js'
import { getTraceId } from '@defra/hapi-tracing'
import Boom from '@hapi/boom'
import { statusCodes } from '../constants/status-codes.js'

/**
 * @param {string} url
 * @param {RequestOptions} options
 * @returns {Promise<{Response}> | Response}
 */
export async function fetcher(url, options = {}) {
  const tracingHeader = config.get('tracing.header')
  const traceId = getTraceId()

  const response = await fetch(url, {
    ...options,
    method: options?.method ?? 'get',
    headers: {
      ...(options?.headers && options.headers),
      ...(traceId && { [tracingHeader]: traceId }),
      'Content-Type': 'application/json'
    }
  })
  if (response.status >= 300) {
    switch (response.status) {
      case statusCodes.badRequest:
        throw Boom.badRequest('Bad input')
      case statusCodes.unauthorized:
        throw Boom.unauthorized('Missing or invalid token')
      case statusCodes.notFound:
        throw Boom.notFound('Resource not found')
      case statusCodes.conflict:
        throw Boom.conflict('Duplicate resource')
      case statusCodes.internalError:
        throw Boom.internal('Something went wrong')
      default:
        throw Boom.boomify(new Error('Unknown error'), {
          statusCode: response.status
        })
    }
  } else {
    return response
  }
}
/**
 * import { Response, RequestOptions } from 'node-fetch'
 */
