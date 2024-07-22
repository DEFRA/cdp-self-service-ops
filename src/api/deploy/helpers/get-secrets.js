import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'

async function getSecrets(service, environment) {
  try {
    const url = `${config.get('portalBackendApiUrl')}/secrets/${environment}/${service}`
    const response = await fetch(url, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
    const json = await response.json()

    if (response.ok) {
      return json
    }
  } catch (e) {
    createLogger().info(e)
  }
  return []
}

export { getSecrets }
