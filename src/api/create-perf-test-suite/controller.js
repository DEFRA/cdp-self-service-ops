import Boom from '@hapi/boom'
import { isNil } from 'lodash'
import { config } from '~/src/config'
import { updateOverallStatus } from '~/src/api/create-microservice/helpers/save-status'
import { perfTestSuiteValidation } from '~/src/api/create-perf-test-suite/helpers/schema/perf-test-suite-validation'
import { createPerfTestSuiteStatus } from '~/src/api/create-perf-test-suite/helpers/status/create-perf-test-suite-status'
import { raiseInfraPullRequest } from '~/src/api/create-perf-test-suite/helpers/raise-infra-pull-request'
import { createPerfTestSuite } from '~/src/api/create-perf-test-suite/helpers/workflow/create-perf-test-suite'

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
    const { team } = await request.server.methods.fetchTeam(payload?.teamId)
    if (isNil(team?.github)) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating env test suite: ${repositoryName}`)

    try {
      await createPerfTestSuiteStatus(
        request.db,
        gitHubOrg,
        repositoryName,
        zone,
        team
      )
    } catch (e) {
      request.logger.error(e)
      throw Boom.badData(
        `repository ${repositoryName} has already been requested or is in progress`
      )
    }

    await createPerfTestSuite(request, repositoryName, payload, team)

    await raiseInfraPullRequest(request, repositoryName, zone)

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
