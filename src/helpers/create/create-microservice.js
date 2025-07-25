import Boom from '@hapi/boom'

import { config } from '../../config/index.js'
import { fetchTeam } from '../fetch-team.js'
import { createInitialEntity } from './create-initial-entity.js'
import {
  createAppConfig,
  createDashboard,
  createNginxUpstreams,
  createSquidConfig,
  createTemplatedRepo,
  createTenantInfrastructure
} from './workflows/index.js'

/**
 * @param {import("pino").Logger} logger
 * @param {string} repositoryName
 * @param {{zone: "public"|"protected", mongo: boolean, redis: boolean, id: string, language: string|null, type: string, entityType: string, entitySubType: string}} template
 * @param {string} templateTag
 * @param {string} teamId
 * @param {{id: string, displayName: string}} user
 * @returns {Promise<void>}
 */
async function createMicroservice({
  logger,
  repositoryName,
  template,
  templateTag,
  teamId,
  user
}) {
  const { team } = await fetchTeam(teamId)
  if (!team?.github) {
    throw Boom.badData(
      `Team ${team.name} does not have a link to a Github team`
    )
  }

  logger.info(`Creating service ${repositoryName}`)

  await createInitialEntity({
    repositoryName,
    entityType: template.entityType,
    entitySubType: template.entitySubType,
    team,
    user
  })

  const topics = ['cdp', 'service', template.language, template.type]

  await Promise.all([
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
  ])
}

export { createMicroservice }
