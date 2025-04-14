import Boom from '@hapi/boom'
import { config } from '~/src/config/index.js'
import { initCreationStatus } from '~/src/helpers/create/init-creation-status.js'
import {
  createAppConfig,
  createSquidConfig,
  createTemplatedRepo
} from '~/src/helpers/create/workflows/index.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { createTenantInfrastructure } from '~/src/helpers/create/workflows/create-tenant-infrastructure.js'
import { calculateOverallStatus } from '~/src/helpers/portal-backend/legacy-status/calculate-overall-status.js'

/**
 * Helper to create test suites that run on the platform (rather than GitHub).
 * @param {import('pino').Logger} logger
 * @param {string} repositoryName
 * @param {string} kind
 * @param {string} teamId
 * @param {{id: string, displayName: string}} user
 * @param {string} templateWorkflow
 * @param {string} serviceTypeTemplate
 * @param {string} templateTag
 * @param {string[]} extraTopics
 * @returns {Promise<void>}
 */
export async function createTestRunnerSuite(
  logger,
  repositoryName,
  kind,
  teamId,
  user,
  templateWorkflow,
  serviceTypeTemplate,
  templateTag,
  extraTopics = []
) {
  const { team } = await fetchTeam(teamId)
  if (!team?.github) {
    throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
  }

  const org = config.get('github.org')
  const zone = 'public'

  await initCreationStatus(
    org,
    kind,
    repositoryName,
    serviceTypeTemplate,
    zone,
    team,
    user,
    [
      config.get('github.repos.createWorkflows'),
      config.get('github.repos.cdpTfSvcInfra'),
      config.get('github.repos.cdpSquidProxy'),
      config.get('github.repos.cdpAppConfig')
    ]
  )

  const topics = ['cdp', 'test', 'test-suite', ...[extraTopics]]

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
      test_suite: repositoryName
    })
  ])

  // calculate and set the overall status
  await calculateOverallStatus(repositoryName)
}
