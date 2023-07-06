function getClusterName(imageName, frontendServices, backendServices) {
  const frontendClusterServiceNames = frontendServices
    .map((service) => service?.container_image)
    .filter(Boolean)

  const backendClusterServiceNames = backendServices
    .map((service) => service?.container_image)
    .filter(Boolean)

  if (frontendClusterServiceNames.includes(imageName)) {
    return 'frontend'
  }

  if (backendClusterServiceNames.includes(imageName)) {
    return 'backend'
  }

  throw new Error(`Unable to determine which cluster ${imageName} belongs to.`)
}

export { getClusterName }
