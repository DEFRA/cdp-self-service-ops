function getCluster(imageName, publicServices, protectedServices) {
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

  throw new Error(`${imageName} does not belong to a cluster`)
}

export { getCluster }
