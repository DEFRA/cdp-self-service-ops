import { config } from '~/src/config'

async function registerPendingSecret({
  environment,
  service,
  secretKey,
  action
}) {
  const url = config.get('portalBackendUrl') + '/secrets/register/pending'
  await fetch(url, {
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
