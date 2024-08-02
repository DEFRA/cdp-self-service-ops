import { config } from '~/src/config'
import fetch from 'node-fetch'
import Boom from '@hapi/boom'

async function fetchTeam(teamId) {
  const teamsEndpointUrl =
    config.get('userServiceBackendUrl') + `/teams/${teamId}`

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

export { fetchTeam }
