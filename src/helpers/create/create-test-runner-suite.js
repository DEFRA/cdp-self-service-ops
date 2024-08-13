import Boom from '@hapi/boom'
import { config } from '~/src/config'
import {
  initCreationStatus,
  updateOverallStatus
} from '~/src/helpers/create/init-creation-status'
import {
  createTemplatedRepo,
  createSquidConfig
} from '~/src/helpers/create/workflows'
import { fetchTeam } from '~/src/helpers/fetch-team'
import { createTenantInfrastructure } from '~/src/helpers/create/workflows/create-tenant-infrastructure'

/**
 * Helper to create test suites that run on the platform (rather than GitHub).
 *
 * @param {{db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} repositoryName
 * @param {string} kind
 * @param {string} teamId
 * @param {{id: string, displayName: string}} user
 * @param {string} templateWorkflow
 * @param {string[]} extraTopics
 * @returns {Promise<void>}
 */
export async function createTestRunnerSuite(
  request,
  repositoryName,
  kind,
  teamId,
  user,
  templateWorkflow,
  extraTopics = []
) {
  const { team } = await fetchTeam(teamId)
  if (!team?.github) {
    throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
  }

  const org = config.get('github.org')
  const zone = 'public'

  await initCreationStatus(
    request.db,
    org,
    kind,
    repositoryName,
    templateWorkflow,
    zone,
    team,
    user,
    [
      config.get('github.repos.createWorkflows'),
      config.get('github.repos.cdpTfSvcInfra'),
      config.get('github.repos.cdpSquidProxy')
    ]
  )

  const topics = ['cdp', 'test', 'test-suite', ...[extraTopics]]

  await Promise.all([
    createTemplatedRepo(
      request,
      templateWorkflow,
      repositoryName,
      team,
      topics
    ),
    createSquidConfig(request, repositoryName),
    createTenantInfrastructure(request, repositoryName, {
      service: repositoryName,
      zone,
      mongo_enabled: 'false',
      redis_enabled: 'false',
      service_code: team.serviceCodes[0] ?? '',
      test_suite: repositoryName
    })
  ])

  // calculate and set the overall status
  await updateOverallStatus(request.db, repositoryName)
}
