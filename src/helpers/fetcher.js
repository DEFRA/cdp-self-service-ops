import { config } from '~/src/config/index.js'
import { getTraceId } from '@defra/hapi-tracing'

/**
 * @param {string} url
 * @param {RequestOptions} options
 * @returns {Promise<{Response}> | Response}
 */
export async function fetcher(url, options = {}) {
  const tracingHeader = config.get('tracing.header')
  const traceId = getTraceId()

  return await fetch(url, {
    ...options,
    method: options?.method || 'get',
    headers: {
      ...(options?.headers && options.headers),
      ...(traceId && { [tracingHeader]: traceId }),
      'Content-Type': 'application/json'
    }
  })
}
/**
 * import { Response, RequestOptions } from 'node-fetch'
 */
