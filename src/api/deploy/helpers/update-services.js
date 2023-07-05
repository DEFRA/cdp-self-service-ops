function updateServices(data, imageName, version) {
  const services = JSON.parse(data) // TODO: validate the content

  const index = services.findIndex(
    (service) => service.container_image === imageName
  )
  const service = services[index]

  if (index === -1) {
    throw new Error(`service ${imageName} is not deployed in this cluster!`)
  } else {
    if (service.container_version === version) {
      // Re-deploy
      service.env_vars = {
        ...(service.env_vars && service.env_vars),
        CDP_REDEPLOY: new Date().toISOString()
      }
    } else {
      // Deploy
      service.container_version = version

      if (service.env_vars?.CDP_REDEPLOY) {
        delete service.env_vars?.CDP_REDEPLOY
      }
    }

    if (service.desired_count === 0) {
      // TODO pass in desired count from the portal
      service.desired_count = 1
    }
  }

  return JSON.stringify(services, null, 2)
}

export { updateServices }
