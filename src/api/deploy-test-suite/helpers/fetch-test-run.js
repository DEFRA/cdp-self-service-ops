import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * Gets test run details from cdp-portal-backend.
 * @typedef {object} TestRun
 * @property {string} runId
 * @property {string} testSuite
 * @property {string} taskArn
 * @param {string} runId
 * @returns {Promise<TestRun>}
 */
async function fetchTestRun(runId) {
  const url = config.get('portalBackendUrl') + `/test-run/${runId}`
  const response = await fetcher(url, { method: 'get' })
  if (response.ok) {
    return await response.json()
  }
  throw Boom.notFound(`Test Run ${runId} not found`)
}

export { fetchTestRun }
