import Boom from '@hapi/boom'
import { config } from '~/src/config'
import { updateOverallStatus } from '~/src/api/create-microservice/helpers/save-status'
import { perfTestSuiteValidation } from '~/src/api/create-perf-test-suite/helpers/schema/perf-test-suite-validation'
import { raiseInfraPullRequest } from '~/src/helpers/create/raise-infra-pull-request'
import { testRunnerEnvironments } from '~/src/config/test-runner-environments'
import { creations } from '~/src/constants/creations'
import { createTestSuiteStatus } from '~/src/helpers/create/create-test-suite-status'
import { createTemplatedRepo } from '~/src/helpers/create/create-templated-repo'
import { createSquidConfig } from '~/src/helpers/create/create-squid-config'
import { fetchTeam } from '~/src/helpers/fetch-team'

const createPerfTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: perfTestSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const gitHubOrg = config.get('gitHubOrg')

    const payload = request?.payload
    const repositoryName = payload?.repositoryName

    const zone = 'public'
    const { team } = await fetchTeam(payload?.teamId)
    if (!team?.github) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating env test suite: ${repositoryName}`)

    try {
      await createTestSuiteStatus(
        request.db,
        gitHubOrg,
        repositoryName,
        zone,
        team,
        creations.perfTestsuite,
        config.get('createPerfTestSuiteWorkflow')
      )
    } catch (e) {
      request.logger.error(e)
      throw Boom.badData(
        `Repository ${repositoryName} has already been requested or is in progress`
      )
    }

    const template = config.get('createPerfTestSuiteWorkflow')
    const topics = ['cdp', 'test', 'test-suite', 'performance']
    await createTemplatedRepo(request, template, repositoryName, team, topics)

    await createSquidConfig(request, repositoryName)

    await raiseInfraPullRequest(
      request,
      repositoryName,
      zone,
      testRunnerEnvironments.performance
    )

    // calculate and set the overall status
    await updateOverallStatus(request.db, repositoryName)

    return h
      .response({
        message: 'Perf test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createPerfTestSuiteController }
