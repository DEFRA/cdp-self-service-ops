import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

async function registerPendingSecret({
  environment,
  service,
  secretKey,
  action
}) {
  const url = config.get('portalBackendUrl') + '/secrets/register/pending'
  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      environment,
      service,
      secretKey,
      action
    })
  })
}

export { registerPendingSecret }
