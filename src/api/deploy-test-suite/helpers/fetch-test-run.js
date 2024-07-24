import { config } from '~/src/config'
import Boom from '@hapi/boom'

/**
 * Gets test run details from cdp-portal-backend.
 *
 * @typedef {Object} TestRun
 * @property {string} runId
 * @property {string}testSuite
 * @property {string} taskArn
 *
 * @param runId
 * @return {Promise<TestRun>}
 */
async function fetchTestRun(runId) {
  const url = config.get('portalBackendApiUrl') + `/test-run/${runId}`
  const response = await fetch(url, { method: 'get' })
  const json = await response.json()
  if (response.ok) {
    return json
  }
  throw Boom.notFound(`Test Run ${runId} not found`)
}

export { fetchTestRun }
