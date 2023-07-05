function deploymentConfig(imageName, version, cluster, environment) {
  return {
    container_image: imageName,
    container_port: 8085,
    container_version: version,
    desired_count: 0, // We are just setting up the config here, not deploying
    healthcheck: `/${imageName}/health`, // TODO remove app name routing prefix once routing has been fixed in AWS
    name: imageName,
    task_cpu: 1024,
    task_memory: 2048,
    env_files: [
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/global/global_${cluster}_fixed.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/services/${imageName}/${environment}/${imageName}.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/services/${imageName}/defaults.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/environments/${environment}/defaults.env`,
        type: 's3'
      }
    ]
  }
}

export { deploymentConfig }
