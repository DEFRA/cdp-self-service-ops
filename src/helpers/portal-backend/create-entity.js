import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

async function createEntity(payload) {
  const url = `${config.get('portalBackendUrl')}/entities`
  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export { createEntity }
