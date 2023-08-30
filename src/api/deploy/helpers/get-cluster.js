import Boom from '@hapi/boom'

function getCluster(environment, imageName, publicServices, protectedServices) {
  const publicClusterServiceNames = publicServices
    .map((service) => service?.container_image)
    .filter(Boolean)

  const protectedClusterServiceNames = protectedServices
    .map((service) => service?.container_image)
    .filter(Boolean)

  if (publicClusterServiceNames.includes(imageName)) {
    return {
      clusterName: 'public',
      clusterServices: publicServices
    }
  }

  if (protectedClusterServiceNames.includes(imageName)) {
    return {
      clusterName: 'protected',
      clusterServices: protectedServices
    }
  }

  throw Boom.notFound(
    `${imageName} does not belong to a cluster in the ${environment} environment`
  )
}

export { getCluster }
