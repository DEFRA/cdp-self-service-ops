import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

async function getSecretKeysForService(service, environment) {
  try {
    const url = `${config.get('portalBackendApiUrl')}/secrets/${environment}/${service}`
    const response = await fetch(url, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
    const json = await response.json()

    if (response.ok) {
      return json?.secrets ?? []
    }
  } catch (e) {
    logger.info(e)
  }
  return []
}

export { getSecretKeysForService }
