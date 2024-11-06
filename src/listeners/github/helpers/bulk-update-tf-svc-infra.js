import { config } from '~/src/config'
import {
  findAllInProgressOrFailed,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import { updateOverallStatus } from '~/src/helpers/create/init-creation-status'
import { createPlaceholderArtifact } from '~/src/listeners/github/helpers/create-placeholder-artifact'
import { createLogger } from '~/src/helpers/logging/logger'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service'

/**
 * given a list of services, update the tf-svc-infra status for all of them to success
 * and create the placeholder artifact
 * @param db
 * @param trimmedWorkflow
 * @param status
 * @returns {Promise<void>}
 */
const bulkUpdateTfSvcInfra = async (db, trimmedWorkflow, status) => {
  const logger = createLogger()
  const org = config.get('github.org')
  const tfSvcInfra = config.get('github.repos.cdpTfSvcInfra')

  const inProgressOrFailed = await findAllInProgressOrFailed(db)

  // anything that's in-progress/failed and now exists in tenant-services
  // exists, so should be updated

  const servicesToUpdate = []

  for (const service of inProgressOrFailed) {
    const name = service.repositoryName

    // TODO: maybe use exact commit ref of workflow
    const tenantConfig = await lookupTenantService(name, 'management')
    if (tenantConfig) {
      servicesToUpdate.push({ name, tenantConfig })
    }
  }

  logger.info(
    `Updating ${servicesToUpdate.length} ${tfSvcInfra} statuses to success`
  )

  for (let i = 0; i < servicesToUpdate.length; i++) {
    const serviceName = servicesToUpdate[i].name

    let runMode = 'Service'
    if (servicesToUpdate[i]?.tenantConfig?.test_suite) {
      runMode = 'Job'
    }

    logger.info(`Updating ${serviceName} ${tfSvcInfra} status to success`)

    await updateWorkflowStatus(
      db,
      serviceName,
      tfSvcInfra,
      'main',
      status,
      trimmedWorkflow
    )
    await updateOverallStatus(db, serviceName)

    logger.info(
      { servicesToUpdate },
      `Creating ${runMode} placeholder artifact for ${serviceName}`
    )

    await createPlaceholderArtifact({
      service: serviceName,
      gitHubUrl: `https://github.com/${org}/${serviceName}`,
      runMode
    })
  }
}

export { bulkUpdateTfSvcInfra }
