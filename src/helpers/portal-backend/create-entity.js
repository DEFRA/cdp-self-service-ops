import { config } from '#config/config.js'
import { fetcher } from '../fetcher.js'

async function createEntity(payload) {
  const url = `${config.get('portalBackendUrl')}/entities`

  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export { createEntity }
