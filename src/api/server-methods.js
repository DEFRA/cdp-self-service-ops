import fetch from 'node-fetch'
import Boom from '@hapi/boom'

import { config } from '~/src/config'

function registerServerMethods(server) {
  server.method('fetchTeam', fetchTeam, {
    cache: {
      expiresIn: 60 * 1000,
      staleIn: 30 * 1000,
      staleTimeout: 10 * 1000,
      generateTimeout: 100
    }
  })
}

async function fetchTeam(teamId) {
  const teamsEndpointUrl = config.get('userServiceApiUrl') + `/teams/${teamId}`

  const response = await fetch(teamsEndpointUrl, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json
  }

  throw Boom.boomify(new Error(json.message), { statusCode: response.status })
}

export { registerServerMethods }
