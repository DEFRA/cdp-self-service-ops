import { lookupTenantService } from '~/src/api/deploy/helpers/lookupTenantService'
import { serviceToSecretsMap } from '~/src/api/deploy/helpers/serviceToSecretsMap'

async function generateDeployMessage(payload) {
  const tenantService = await lookupTenantService(
    payload.environment,
    payload.imageName
  )

  if (tenantService === undefined) {
    throw new Error(`Unable to lookup ${payload.imageName} in tenant services`)
  }

  return {
    container_image: payload.imageName,
    container_port: 8085,
    container_version: payload.version,
    desired_count: payload.instanceCount,
    env_files: [
      {
        value: `arn:aws:s3:::cdp-${payload.environment}-service-configs/global/global_protected_fixed.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${payload.environment}-service-configs/services/${payload.imageName}/${payload.environment}/${payload.imageName}.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${payload.environment}-service-configs/services/${payload.imageName}/defaults.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-${payload.environment}-service-configs/environments/${payload.environment}/defaults.env`,
        type: 's3'
      }
    ],
    env_vars: {},
    healthcheck: `/${payload.imageName}/health`,
    name: payload.imageName,
    secrets:
      serviceToSecretsMap[payload.imageName]?.[payload.environment] ?? {},
    task_cpu: payload.cpu,
    task_memory: payload.memory,
    deploy_metrics: true,
    environment: payload.environment,
    zone: tenantService.zone,
    deployed_by: {
      user_id: payload.user.id,
      display_name: payload.user.displayName
    }
  }
}

export { generateDeployMessage }
