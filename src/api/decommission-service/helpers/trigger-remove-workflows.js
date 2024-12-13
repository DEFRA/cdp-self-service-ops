import { removeAppConfig } from '~/src/helpers/remove/workflows/remove-app-config.js'
import { removeDashboard } from '~/src/helpers/remove/workflows/remove-dashboard.js'
import { removeNginxUpstreams } from '~/src/helpers/remove/workflows/remove-nginx-upstreams.js'
import {
  removeSquidConfig,
  removeTenantInfrastructure
} from '~/src/helpers/remove/workflows/index.js'

/**
 * Calls remove workflows for specified service.
 * @param {string} serviceName
 * @param {object} repository
 * @param {import("pino").Logger} logger
 */
async function triggerRemoveWorkflows(serviceName, repository, logger) {
  const isTestSuite = repository.topics.includes('test-suite')

  if (!isTestSuite) {
    const zone = repository.topics.includes('backend') ? 'Protected' : 'Public'

    await removeDashboard(serviceName, logger)
    await removeNginxUpstreams(serviceName, zone, logger)
  }

  await removeAppConfig(serviceName, logger)
  await removeSquidConfig(serviceName, logger)
  await removeTenantInfrastructure(serviceName, logger)
}

export { triggerRemoveWorkflows }
