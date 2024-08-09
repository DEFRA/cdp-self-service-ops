import Boom from '@hapi/boom'
import { config } from '~/src/config'
import {
  initCreationStatus,
  updateOverallStatus
} from '~/src/api/create-microservice/helpers/save-status'
import { createTemplatedRepo } from '~/src/helpers/create/create-templated-repo'
import { createSquidConfig } from '~/src/helpers/create/create-squid-config'
import { fetchTeam } from '~/src/helpers/fetch-team'
import { createTenantService } from '~/src/helpers/create/create-tenant-service'

/**
 *
 * @param {{db: import('mongodb').Db, logger: import('pino').Logger, auth: {credentials: Object|undefined}}} request
 * @param {string} repositoryName
 * @param {string} kind
 * @param {string} teamId
 * @param {string} templateWorkflow
 * @param {string[]} extraTopics
 * @returns {Promise<void>}
 */
export async function createTestRunnerSuite(
  request,
  repositoryName,
  kind,
  teamId,
  templateWorkflow,
  extraTopics = []
) {
  const { team } = await fetchTeam(teamId)
  if (!team?.github) {
    throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
  }

  const zone = 'public'

  try {
    await initCreationStatus(
      request.db,
      config.get('github.org'),
      kind,
      repositoryName,
      templateWorkflow,
      zone,
      team,
      request.auth?.credentials,
      [
        config.get('github.repos.createWorkflows'),
        config.get('github.repos.cdpTfSvcInfra'),
        config.get('github.repos.cdpSquidProxy')
      ]
    )
  } catch (e) {
    request.logger.error(e)
    throw Boom.badData(
      `Repository ${repositoryName} has already been requested or is in progress`
    )
  }

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
    createTenantService(request, repositoryName, {
      service: repositoryName,
      zone,
      mongo_enabled: false,
      redis_enabled: false,
      service_code: team.serviceCodes,
      test_suite: repositoryName
    })
  ])

  // calculate and set the overall status
  await updateOverallStatus(request.db, repositoryName)
}
