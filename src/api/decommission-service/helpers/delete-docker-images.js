import { deleteDockerHubImages } from '~/src/helpers/remove/workflows/delete-dockerhub-images.js'
import { deleteEcrImages } from '~/src/helpers/remove/workflows/delete-ecr-images.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'

/**
 * Delete docker images
 * @param {string} serviceName
 * @param {{id: string, displayName: string}} user
 * @param {Logger} logger
 * @returns {Promise<undefined|*>}
 */
export async function deleteDockerImages(serviceName, user, logger) {
  logger.info(`Deleting docker images for service: ${serviceName}`)

  if (isFeatureEnabled(featureToggles.dockerImages.deleteEcr)) {
    await deleteEcrImages(serviceName, logger)
  } else {
    logger.info('Deleting ECR images feature is disabled')
  }

  if (isFeatureEnabled(featureToggles.dockerImages.deleteDockerHub)) {
    await deleteDockerHubImages(serviceName, logger)
  } else {
    logger.info('Deleting DockerHub images feature is disabled')
  }
}
