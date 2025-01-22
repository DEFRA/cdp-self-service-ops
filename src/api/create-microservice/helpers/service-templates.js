import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Boom from '@hapi/boom'

async function serviceTemplates() {
  const url = config.get('portalBackendUrl') + '/service-templates'
  const response = await fetcher(url, { method: 'get' })
  const json = await response.json()

  if (response.ok) {
    return json.serviceTypes
  }

  throw Boom.boomify(new Error(json.message), { statusCode: response.status })
}

export { serviceTemplates }
