import { deleteDockerHubImages } from '~/src/helpers/remove/workflows/delete-dockerhub-images.js'
import { deleteEcrImages } from '~/src/helpers/remove/workflows/delete-ecr-images.js'

/**
 * Delete docker images
 * @param {string} serviceName
 * @param {Logger} logger
 * @returns {Promise<undefined|*>}
 */
export async function deleteDockerImages(serviceName, logger) {
  logger.info(`Deleting docker images for service: ${serviceName}`)

  await deleteEcrImages(serviceName, logger)

  await deleteDockerHubImages(serviceName, logger)
}
