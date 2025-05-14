import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

async function getRepoTeams(repoName) {
  const url = `${config.get('portalBackendUrl')}/repositories/${repoName}`
  const response = await fetcher(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const repository = await response.json()

  if (response.ok) {
    return repository?.teams
  }

  throw Boom.boomify(new Error(repository.message), {
    statusCode: response.status
  })
}

export { getRepoTeams }
