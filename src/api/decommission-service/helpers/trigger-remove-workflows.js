import {
  removeAppConfig,
  removeDashboard,
  removeDeployment,
  removeNginxUpstreams,
  removeSquidConfig,
  removeTenantInfrastructure
} from '~/src/helpers/remove/workflows/index.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'

/**
 * Calls remove workflows for specified service.
 * @param {string} serviceName
 * @param {object} repository
 * @param {import("pino").Logger} logger
 */
async function triggerRemoveWorkflows(serviceName, repository, logger) {
  logger.info(`Triggering remove workflows service: ${serviceName}`)
  const isTestSuite = repository.topics.includes('test-suite')

  if (isFeatureEnabled(featureToggles.removeServiceWorkflows)) {
    if (!isTestSuite) {
      const zone = repository.topics.includes('backend')
        ? 'Protected'
        : 'Public'

      await removeDashboard(serviceName, logger)
      await removeNginxUpstreams(serviceName, zone, logger)
    }

    await removeAppConfig(serviceName, logger)
    await removeSquidConfig(serviceName, logger)
    await removeTenantInfrastructure(serviceName, logger)
    await removeDeployment(serviceName, logger)
  } else {
    logger.info('Remove service workflows feature is disabled')
  }
}

export { triggerRemoveWorkflows }
