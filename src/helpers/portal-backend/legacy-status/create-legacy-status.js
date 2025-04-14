import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * @param {object} payload
 * @returns {Promise<Artifact>}
 */
async function createLegacyStatus(payload) {
  const url = `${config.get('portalBackendUrl')}/legacy-statuses`

  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export { createLegacyStatus }
