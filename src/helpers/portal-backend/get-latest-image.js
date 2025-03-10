import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * Gets test run details from cdp-portal-backend.
 * @typedef {object} Artifact
 * @property {string} created
 * @property {string} tag
 * @property {string} sha256
 * @property {string} serviceName
 * @property {{}} annotations
 */

/**
 * @param {string} serviceName
 * @returns {Promise<Artifact>}
 */
async function getLatestImage(serviceName) {
  const url =
    config.get('portalBackendUrl') + `/artifacts/${serviceName}/latest`
  const response = await fetcher(url, { method: 'get' })
  if (response.ok) {
    return await response.json()
  }
  throw Boom.notFound(`No images found for ${serviceName}`)
}

export { getLatestImage }
