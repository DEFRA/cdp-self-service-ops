import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
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
 * @param {{zone: 'public'|'protected', mongo: boolean, redis: boolean, id: string, language: string|null, type: string}} template
 * @param {string} templateTag
 * @param {string} teamId
 * @param {{id: string, displayName: string}} user
 * @returns {Promise<void>}
 */
async function createMicroservice(
  logger,
  repositoryName,
  template,
  templateTag,
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
      template.id,
      template.zone,
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

  const topics = ['cdp', 'service', template.language, template.type]

  const promises = [
    createTemplatedRepo(
      logger,
      config.get('workflows.createMicroService'),
      repositoryName,
      team.github,
      topics,
      {
        serviceTypeTemplate: template.id,
        templateTag
      }
    ),
    createTenantInfrastructure(logger, repositoryName, {
      service: repositoryName,
      zone: template.zone,
      mongo_enabled: template.mongo ? 'true' : 'false',
      redis_enabled: template.redis ? 'true' : 'false',
      service_code: team.serviceCodes?.at(0) ?? ''
    }),
    createAppConfig(logger, repositoryName, team.github),
    createNginxUpstreams(logger, repositoryName, template.zone),
    createSquidConfig(logger, repositoryName),
    createDashboard(logger, repositoryName, template.zone)
  ]

  await Promise.all(promises)

  // calculate and set the overall status
  await calculateOverallStatus(repositoryName)
}

export { createMicroservice }
