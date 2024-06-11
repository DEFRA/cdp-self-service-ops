import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service'
import { serviceToSecretsMap } from '~/src/api/deploy/helpers/service-to-secrets-map'

async function generateDeployMessage(
  imageName,
  version,
  environment,
  instanceCount,
  cpu,
  memory,
  user,
  deploymentId,
  commitSha
) {
  const tenantService = await lookupTenantService(environment, imageName)

  if (tenantService === undefined) {
    throw new Error(`Unable to lookup ${imageName} in tenant services`)
  }

  const basePath = commitSha
    ? `arn:aws:s3:::cdp-${environment}-service-configs/${commitSha}`
    : `arn:aws:s3:::cdp-${environment}-service-configs`

  return {
    container_image: imageName,
    container_port: 8085,
    container_version: version,
    desired_count: instanceCount,
    env_files: [
      {
        value: `${basePath}/global/global_protected_fixed.env`,
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
    zone: tenantService.zone,
    deployed_by: {
      deployment_id: deploymentId,
      user_id: user.id,
      display_name: user.displayName
    }
  }
}

export { generateDeployMessage }
