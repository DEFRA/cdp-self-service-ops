import { serviceToSecretsMap } from '~/src/api/deploy/helpers/service-to-secrets-map'

async function generateDeployMessage(
  deploymentId,
  imageName,
  version,
  environment,
  zone,
  instanceCount,
  cpu,
  memory,
  user,
  configCommitSha
) {
  const basePath = configCommitSha
    ? `arn:aws:s3:::cdp-${environment}-service-configs/${configCommitSha}`
    : `arn:aws:s3:::cdp-${environment}-service-configs`

  return {
    container_image: imageName,
    container_port: 8085,
    container_version: version,
    desired_count: instanceCount,
    env_files: [
      {
        value: `${basePath}/global/global_fixed.env`,
        type: 's3'
      },
      {
        value: `${basePath}/services/${imageName}/${environment}/${imageName}.env`,
        type: 's3'
      },
      {
        value: `${basePath}/services/${imageName}/defaults.env`,
        type: 's3'
      },
      {
        value: `${basePath}/environments/${environment}/defaults.env`,
        type: 's3'
      }
    ],
    env_vars: {},
    healthcheck: `/${imageName}/health`,
    name: imageName,
    secrets: serviceToSecretsMap[imageName]?.[environment] ?? {},
    task_cpu: cpu,
    task_memory: memory,
    deploy_metrics: true,
    environment,
    zone,
    deployed_by: {
      deployment_id: deploymentId,
      user_id: user.id,
      display_name: user.displayName
    }
  }
}

export { generateDeployMessage }
