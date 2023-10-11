import { createLogger } from '~/src/helpers/logging/logger'
import { deploymentConfig } from '~/src/api/create/helpers/deployment-config'

function addDeploymentConfig(data, imageName, clusterName, environment) {
  const logger = createLogger()
  const services = JSON.parse(data) // TODO: validate the content

  const index = services.findIndex(
    (service) => service.container_image === imageName
  )

  if (index === -1) {
    services.push(
      deploymentConfig(imageName, '0.1.0', clusterName, environment)
    )
  } else {
    logger.info(`service ${imageName} is already deployed in this cluster`)
    return
  }

  return JSON.stringify(services, null, 2)
}

export { addDeploymentConfig }
