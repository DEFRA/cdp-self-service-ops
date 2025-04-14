import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * @param {string} repositoryName
 */
async function calculateOverallStatus(repositoryName) {
  const url = `${config.get('portalBackendUrl')}/legacy-statuses/${repositoryName}/overall-status`

  await fetcher(url, {
    method: 'post'
  })
}

export { calculateOverallStatus }
