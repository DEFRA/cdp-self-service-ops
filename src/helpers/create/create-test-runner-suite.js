import Boom from '@hapi/boom'
import { createInitialEntity } from './create-initial-entity.js'
import {
  createAppConfig,
  createSquidConfig,
  createTemplatedRepo
} from './workflows/index.js'
import { fetchTeam } from '../fetch-team.js'
import { createTenantInfrastructure } from './workflows/create-tenant-infrastructure.js'
import { entityTypes } from '../../constants/entities.js'

/**
 * Helper to create test suites
 * @param {{ logger: import('pino').Logger, repositoryName: string, entitySubType: string, teamId: string, user: {id: string, displayName: string}, templateWorkflow: string, templateTag: string}} params
 * @returns {Promise<void>}
 */
export async function createTestRunnerSuite({
  logger,
  repositoryName,
  entitySubType,
  teamId,
  user,
  templateWorkflow,
  templateTag
}) {
  const team = await fetchTeam(teamId)
  if (!team?.github) {
    throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
  }

  const zone = 'public'

  await createInitialEntity({
    repositoryName,
    entityType: entityTypes.testSuite,
    entitySubType,
    team,
    user
  })

  const topics = ['cdp', 'test', 'test-suite', entitySubType.toLowerCase()]

  await Promise.all([
    createTemplatedRepo(
      logger,
      templateWorkflow,
      repositoryName,
      team.github,
      topics,
      { templateTag }
    ),
    createSquidConfig(logger, repositoryName),
    createAppConfig(logger, repositoryName, team.github),
    createTenantInfrastructure(logger, repositoryName, {
      service: repositoryName,
      zone,
      mongo_enabled: 'false',
      redis_enabled: 'false',
      service_code: team.serviceCodes?.at(0) ?? '',
      type: entityTypes.testSuite,
      subtype: entitySubType ?? '',
      team: team.teamId
    })
  ])
}
