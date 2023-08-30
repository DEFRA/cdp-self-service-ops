function deploymentConfig(imageName, version, clusterName, environment) {
  return {
    container_image: imageName,
    container_port: 8085,
    container_version: version,
    desired_count: 0, // We are just setting up the config here, not deploying, hence 0 instances
    healthcheck: `/${imageName}/health`,
    name: imageName,
    task_cpu: 1024,
    task_memory: 2048,
    env_files: [
      {
        value: `arn:aws:s3:::cdp-${environment}-service-configs/global/global_${clusterName}_fixed.env`,
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
    ]
  }
}

export { deploymentConfig }
