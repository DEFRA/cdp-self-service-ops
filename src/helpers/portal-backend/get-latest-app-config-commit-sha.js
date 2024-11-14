import { config } from '~/src/config'
import { fetcher } from '~/src/helpers/fetcher'
import Boom from '@hapi/boom'

async function getLatestAppConfigCommitSha(environment) {
  const url = `${config.get('portalBackendUrl')}/config/latest/${environment}`
  const response = await fetcher(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json?.commitSha
  }

  throw Boom.boomify(new Error(json.message), { statusCode: response.status })
}

export { getLatestAppConfigCommitSha }
