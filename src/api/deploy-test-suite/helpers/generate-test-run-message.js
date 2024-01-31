const generateTestRunMessage = (imageName, environment, runId) => {
  return {
    environment,
    run_id: runId,
    zone: 'public',
    desired_count: 1,
    cluster_name: 'ecs-public',
    name: imageName,
    image: `${imageName}/${imageName}`,
    image_version: 'latest',
    port: 80,
    task_cpu: 1024,
    task_memory: 2048
  }
}

export { generateTestRunMessage }
