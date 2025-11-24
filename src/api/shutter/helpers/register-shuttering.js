import { config } from '../../../config/index.js'
import { fetcher } from '../../../helpers/fetcher.js'

async function registerShuttering({
  environment,
  serviceName,
  url,
  urlType,
  shuttered,
  actionedBy
}) {
  const shutteringUrl = config.get('portalBackendUrl') + '/shuttering/register'
  await fetcher(shutteringUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      environment,
      serviceName,
      url,
      urlType,
      shuttered,
      actionedBy,
      actionedAt: new Date().toISOString()
    })
  })
}

export { registerShuttering }
