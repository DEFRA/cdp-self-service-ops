function updateServices(
  services,
  imageName,
  version,
  instanceCount,
  cpu,
  memory,
  environment
) {
  const index = services.findIndex(
    (service) => service.container_image === imageName
  )

  // service does not exist in the environment, so add it...
  if (index === -1) {
    services.push(
      tfSvcEntry(imageName, version, instanceCount, cpu, memory, environment)
    )
    return JSON.stringify(services, null, 2)
  }

  // ...otherwise update it
  const service = services[index]
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

  return JSON.stringify(services, null, 2)
}

function tfSvcEntry(
  imageName,
  version,
  instanceCount,
  cpu,
  memory,
  environment
) {
  return {
    container_image: imageName,
    container_port: 8085,
    container_version: version,
    desired_count: instanceCount,
    env_files: [
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/global/global_protected_fixed.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/services/${imageName}/${environment}/${imageName}.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/services/${imageName}/defaults.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/environments/${environment}/defaults.env`,
        type: 's3'
      }
    ],
    env_vars: {},
    healthcheck: `/${imageName}/health`,
    name: imageName,
    secrets: {},
    task_cpu: cpu,
    task_memory: memory,
    deploy_metrics: true
  }
}

export { updateServices }
