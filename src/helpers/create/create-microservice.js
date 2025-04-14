import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { serviceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { initCreationStatus } from '~/src/helpers/create/init-creation-status.js'
import { creations } from '~/src/constants/creations.js'
import {
  createAppConfig,
  createDashboard,
  createNginxUpstreams,
  createSquidConfig,
  createTemplatedRepo,
  createTenantInfrastructure
} from '~/src/helpers/create/workflows/index.js'
import { calculateOverallStatus } from '~/src/helpers/portal-backend/legacy-status/calculate-overall-status.js'

/**
 * @param {import('pino').Logger} logger
 * @param {string} repositoryName
 * @param {string} serviceTypeTemplate
 * @param {string} templateTag
 * @param {'public'|'protected'} zone
 * @param {string} teamId
 * @param {{id: string, displayName: string}} user
 * @returns {Promise<void>}
 */
async function createMicroservice(
  logger,
  repositoryName,
  serviceTypeTemplate,
  templateTag,
  zone,
  teamId,
  user
) {
  const org = config.get('github.org')

  const { team } = await fetchTeam(teamId)
  if (!team?.github) {
    throw Boom.badData(
      `Team ${team.name} does not have a link to a Github team`
    )
  }

  logger.info(`Creating service ${repositoryName}`)

  // Set up the initial DB record
  try {
    await initCreationStatus(
      org,
      creations.microservice,
      repositoryName,
      serviceTypeTemplate,
      zone,
      team,
      user,
      [
        config.get('github.repos.createWorkflows'),
        config.get('github.repos.cdpTfSvcInfra'),
        config.get('github.repos.cdpAppConfig'),
        config.get('github.repos.cdpNginxUpstreams'),
        config.get('github.repos.cdpSquidProxy'),
        config.get('github.repos.cdpGrafanaSvc')
      ]
    )
  } catch (e) {
    logger.error(e)
    throw Boom.badData(
      `Repository ${repositoryName} has already been requested or is in progress`
    )
  }

  const topics = [
    'cdp',
    'service',
    serviceTemplates[serviceTypeTemplate]?.language,
    serviceTemplates[serviceTypeTemplate]?.type
  ]

  const promises = [
    createTemplatedRepo(
      logger,
      config.get('workflows.createMicroService'),
      repositoryName,
      team.github,
      topics,
      {
        serviceTypeTemplate,
        templateTag
      }
    ),
    createTenantInfrastructure(logger, repositoryName, {
      service: repositoryName,
      zone,
      mongo_enabled: zone === 'protected' ? 'true' : 'false',
      redis_enabled: zone === 'public' ? 'true' : 'false',
      service_code: team.serviceCodes?.at(0) ?? ''
    }),
    createAppConfig(logger, repositoryName, team.github),
    createNginxUpstreams(logger, repositoryName, zone),
    createSquidConfig(logger, repositoryName),
    createDashboard(logger, repositoryName, zone)
  ]

  await Promise.all(promises)

  // calculate and set the overall status
  await calculateOverallStatus(repositoryName)
}

export { createMicroservice }
