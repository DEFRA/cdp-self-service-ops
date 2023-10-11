function updateServices(
  services,
  imageName,
  version,
  instanceCount,
  cpu,
  memory
) {
  const index = services.findIndex(
    (service) => service.container_image === imageName
  )
  const service = services[index]

  if (index === -1) {
    throw new Error(
      `Service ${imageName} has not been setup in this environment.`
    )
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

    service.desired_count = instanceCount
    service.task_cpu = cpu
    service.task_memory = memory
  }

  return JSON.stringify(services, null, 2)
}

export { updateServices }
