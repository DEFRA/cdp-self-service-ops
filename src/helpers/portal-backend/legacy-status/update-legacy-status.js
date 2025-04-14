import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * @param {string} repositoryName
 * @param {string} fieldName
 * @param {object} detail
 * @returns {Promise<Artifact>}
 */
async function updateLegacyStatus(repositoryName, fieldName, detail) {
  const url = `${config.get('portalBackendUrl')}/legacy-statuses/update`

  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repositoryName,
      fieldName,
      detail
    })
  })
}

export { updateLegacyStatus }
