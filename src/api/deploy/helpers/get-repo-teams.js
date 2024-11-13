import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { fetcher } from '~/src/helpers/fetcher'

async function getRepoTeams(repoName) {
  const url = `${config.get('portalBackendUrl')}/repositories/${repoName}`
  const response = await fetcher(url, {
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
