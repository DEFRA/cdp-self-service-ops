import { config } from '~/src/config/index.js'
import {
  findAllInProgressOrFailed,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo.js'
import { updateOverallStatus } from '~/src/helpers/create/init-creation-status.js'
import { createPlaceholderArtifact } from '~/src/listeners/github/helpers/create-placeholder-artifact.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { lookupTenantServiceFromGitHub } from '~/src/helpers/portal-backend/lookup-tenant-service.js'

/**
 * given a list of services, update the tf-svc-infra status for all of them to success
 * and create the placeholder artifact
 * @param {object} db
 * @param {object} trimmedWorkflow
 * @param {string} status
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
    const tenantConfig = await lookupTenantServiceFromGitHub(
      name,
      'management',
      logger
    )
    if (tenantConfig) {
      servicesToUpdate.push({ name, tenantConfig })
    }
  }

  logger.info(
    `Updating ${servicesToUpdate.length} ${tfSvcInfra} statuses to success`
  )

  for (const serviceToUpdate of servicesToUpdate) {
    const serviceName = serviceToUpdate.name

    let runMode = 'Service'
    if (serviceToUpdate?.tenantConfig?.testSuite) {
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
