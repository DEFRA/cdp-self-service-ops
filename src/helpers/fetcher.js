import { config } from '~/src/config/index.js'
import { getTraceId } from '@defra/hapi-tracing'
import Boom from '@hapi/boom'

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
      case 400:
        throw Boom.badRequest('Bad input')
      case 401:
        throw Boom.unauthorized('Missing or invalid token')
      case 404:
        throw Boom.notFound('Resource not found')
      case 409:
        throw Boom.conflict('Duplicate resource')
      case 500:
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
