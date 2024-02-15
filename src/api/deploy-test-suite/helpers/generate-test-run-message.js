const generateTestRunMessage = (imageName, environment, runId, user) => {
  return {
    environment,
    runId,
    zone: 'public',
    desired_count: 1,
    cluster_name: 'ecs-public',
    name: imageName,
    image: imageName,
    image_version: 'latest',
    port: 80,
    task_cpu: 1024,
    task_memory: 2048,
    webdriver_sidecar: {
      browser: 'chrome',
      version: 'latest'
    },
    deployed_by: user,
    environment_variables: {
      BASE_URL: `https://${environment}.cdp-int.defra.cloud/`,
      ENVIRONMENT: environment
    }
  }
}

export { generateTestRunMessage }
