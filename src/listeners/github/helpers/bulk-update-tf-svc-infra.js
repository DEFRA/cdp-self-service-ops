import { lookupTenantServicesForCommit } from '~/src/listeners/github/helpers/lookup-tenant-service-for-commit'
import { config, environments } from '~/src/config'
import {
  findAllInProgressOrFailed,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import { updateOverallStatus } from '~/src/api/create-microservice/helpers/save-status'
import { createPlaceholderArtifact } from '~/src/listeners/github/helpers/create-placeholder-artifact'
import { createLogger } from '~/src/helpers/logging/logger'
import { ackEvent } from '~/src/api/helpers/queued-events/queued-events'

// given a list of services, update the tf-svc-infra status for all of them to success
// and create the placeholder artifact
const bulkUpdateTfSvcInfra = async (db, trimmedWorkflow, status) => {
  const logger = createLogger()
  const org = config.get('gitHubOrg')
  const tfSvcInfra = config.get('gitHubRepoTfServiceInfra')
  const eventType = config.get('serviceInfraCreateEvent')

  const tenants = await lookupTenantServicesForCommit(environments.management)

  logger.info(tenants)

  if (tenants === undefined) {
    // TODO: handle error
    logger.error('Failed to lookup tenant services')
  }
  const tenantNames = new Set(Object.keys(tenants))
  const inProgressOrFailed = await findAllInProgressOrFailed(db)

  // anything that's in-progress/failed and now exists in tenant-services
  // exists, so should be updated
  const servicesToUpdate = inProgressOrFailed
    .filter((s) => tenantNames.has(s.repositoryName))
    .map((s) => {
      return { name: s.repositoryName, tenantConfig: tenants[s.repositoryName] }
    })

  logger.info(
    `Updating ${servicesToUpdate.length} ${tfSvcInfra} statuses to success`
  )

  for (let i = 0; i < servicesToUpdate.length; i++) {
    const serviceName = servicesToUpdate[i].name

    let runMode = 'Service'
    if (servicesToUpdate[i].tenantConfig.testSuite !== undefined) {
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

    await ackEvent(db, serviceName, eventType)
  }
}

export { bulkUpdateTfSvcInfra }
