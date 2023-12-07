import { lookupTenantServicesForCommit } from '~/src/listeners/github/helpers/lookup-tenant-service-for-commit'
import { config, environments } from '~/src/config'
import { findAllInProgressOrFailed } from '~/src/helpers/db/status/find-all-in-progress-or-failed'
import { createPlaceholderArtifact } from '~/src/listeners/github/helpers/create-placeholder-artifact'
import { updateSubStatus } from '~/src/helpers/db/status/update-sub-status'

const { createLogger } = require('~/src/helpers/logging/logger')

// given a list of services, update the tf-svc-infra status for all of them to success
// and create the placeholder artifact
const bulkUpdateTfSvcInfra = async (db, trimmedWorkflow, status) => {
  const logger = createLogger()
  const org = config.get('gitHubOrg')
  const tfSvcInfra = config.get('githubRepoTfServiceInfra')

  const tenantServices = await lookupTenantServicesForCommit(
    environments.management
  )

  logger.info(tenantServices)

  if (tenantServices === undefined) {
    // TODO: handle error
    logger.error('failed to lookup tenant services')
  }
  const createdServices = new Set(Object.keys(tenantServices))
  const inProgressOrFailed = await findAllInProgressOrFailed(db)

  // anything that's in-progress/failed and now exists in tenant-services
  // exists, so should be updated
  const servicesToUpdate = inProgressOrFailed
    .filter((s) => createdServices.has(s.repositoryName))
    .map((s) => s.repositoryName)

  logger.info(
    `Updating ${servicesToUpdate.length} ${tfSvcInfra} statuses to success`
  )

  for (let i = 0; i < servicesToUpdate.length; i++) {
    const serviceName = servicesToUpdate[i]
    logger.info(
      `bulk-tf-svc-infra-update to ${serviceName} ${tfSvcInfra} status to success`
    )

    try {
      await updateSubStatus(db, serviceName, tfSvcInfra, status, {
        'main.workflow': trimmedWorkflow
      })

      await createPlaceholderArtifact({
        service: serviceName,
        githubUrl: `https://github.com/${org}/${serviceName}`
      })
    } catch (e) {
      logger.error(
        `Failed to update update ${tfSvcInfra} workflow for ${serviceName}`
      )
      logger.error(e)
    }
  }
}

export { bulkUpdateTfSvcInfra }
