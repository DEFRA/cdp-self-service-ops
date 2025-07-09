import { archiveGithubRepo } from '~/src/helpers/remove/workflows/archive-github-repo.js'
import { deleteEcrImages } from '~/src/helpers/remove/workflows/delete-ecr-images.js'
import { deleteDockerHubImages } from '~/src/helpers/remove/workflows/delete-dockerhub-images.js'
import { removeDashboard } from '~/src/helpers/remove/workflows/remove-dashboard.js'
import { removeNginxUpstreams } from '~/src/helpers/remove/workflows/remove-nginx-upstreams.js'
import { removeAppConfig } from '~/src/helpers/remove/workflows/remove-app-config.js'
import { removeSquidConfig } from '~/src/helpers/remove/workflows/remove-squid-config.js'
import { removeTenantInfrastructure } from '~/src/helpers/remove/workflows/remove-tenant-infrastructure.js'

/**
 * Calls remove workflows for specified entity.
 * @param {string} entityName
 * @param {object} entity
 * @param {import("pino").Logger} logger
 */
async function triggerRemoveWorkflows(entityName, entity, logger) {
  logger.info(`Deleting docker images for service: ${entityName}`)

  await deleteEcrImages(entityName, logger)
  await deleteDockerHubImages(entityName, logger)

  logger.info(`Triggering remove workflows service: ${entityName}`)
  const isTestSuite = entity.Type === 'TestSuite'

  if (!isTestSuite) {
    const zone = entity.SubType === 'Backend' ? 'Protected' : 'Public'

    await removeDashboard(entityName, logger)
    await removeNginxUpstreams(entityName, zone, logger)
  }

  await removeAppConfig(entityName, logger)
  await removeSquidConfig(entityName, logger)
  await removeTenantInfrastructure(entityName, logger)

  logger.info(`Triggering archive GitHub repo workflow for: ${entityName}`)
  await archiveGithubRepo(entityName, logger)
}

export { triggerRemoveWorkflows }
