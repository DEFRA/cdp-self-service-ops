import Boom from '@hapi/boom'
import { config } from '~/src/config'
import { updateOverallStatus } from '~/src/api/create-microservice/helpers/save-status'
import { raiseInfraPullRequest } from '~/src/helpers/create/raise-infra-pull-request'
import { testRunnerEnvironments } from '~/src/config/test-runner-environments'
import { createTestSuiteStatus } from '~/src/helpers/create/create-test-suite-status'
import { creations } from '~/src/constants/creations'
import { smokeTestSuiteValidation } from '~/src/api/create-smoke-test-suite/helpers/schema/smoke-test-suite-validation'
import { createTemplatedRepo } from '~/src/helpers/create/create-templated-repo'
import { createSquidConfig } from '~/src/helpers/create/create-squid-config'
import { fetchTeam } from '~/src/helpers/fetch-team'

const createSmokeTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: smokeTestSuiteValidation,
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

    request.logger.info(`Creating smoke test suite: ${repositoryName}`)

    try {
      await createTestSuiteStatus(
        request.db,
        gitHubOrg,
        repositoryName,
        zone,
        team,
        creations.smokeTestSuite,
        'cdp-node-env-test-suite-template' // for now env and smoke share the same template
      )
    } catch (e) {
      request.logger.error(e)
      throw Boom.badData(
        `Repository ${repositoryName} has already been requested or is in progress`
      )
    }

    const template = config.get('createSmokeTestSuiteWorkflow')
    const topics = ['cdp', 'test', 'test-suite', 'smoke']
    await createTemplatedRepo(request, template, repositoryName, team, topics)

    await createSquidConfig(request, repositoryName)

    await raiseInfraPullRequest(
      request,
      repositoryName,
      zone,
      testRunnerEnvironments.smoke
    )

    // calculate and set the overall status
    await updateOverallStatus(request.db, repositoryName)

    return h
      .response({
        message: 'Smoke test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createSmokeTestSuiteController }
