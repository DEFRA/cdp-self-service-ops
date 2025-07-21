import Boom from '@hapi/boom'

import { config } from '../config/index.js'
import { fetcher } from './fetcher.js'

/**
 *
 * @param {string} teamId
 * @returns {Promise<{name: string, description: string, github: string, serviceCodes: string[], teamId: string, users: {userId: string, name:string}[]}>}
 */
async function fetchTeam(teamId) {
  const teamsEndpointUrl =
    config.get('userServiceBackendUrl') + `/teams/${teamId}`

  const response = await fetcher(teamsEndpointUrl, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json
  }

  throw Boom.boomify(new Error(json.message), { statusCode: response.status })
}

export { fetchTeam }
