import Boom from '@hapi/boom'

import { config } from '~/src/config'

async function getRepoTeams(repoName) {
  const url = `${config.get('portalBackendApiUrl')}/repositories/${repoName}`
  const response = await fetch(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json?.repository?.teams
  }

  throw Boom.boomify(new Error(json.message), { statusCode: response.status })
}

export { getRepoTeams }
