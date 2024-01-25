import Boom from '@hapi/boom'
import { isNil } from 'lodash'
import { config } from '~/src/config'
import { envTestSuiteValidation } from '~/src/api/create-env-test-suite/helpers/schema/env-test-suite-validation'
import { createEnvTestSuiteStatus } from '~/src/api/create-env-test-suite/helpers/status/create-env-test-suite-status'
import { createEnvTestSuite } from '~/src/api/create-env-test-suite/helpers/workflow/create-env-test-suite'
import { updateOverallStatus } from '~/src/api/create-microservice/helpers/save-status'
import { doUpdateTfSvcInfra } from '~/src/api/create-microservice/helpers/update-tfsvcinfra'

const createEnvTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: envTestSuiteValidation,
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
      await createEnvTestSuiteStatus(
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

    await createEnvTestSuite(request, repositoryName, payload, team)

    await doUpdateTfSvcInfra(request, repositoryName, zone)

    // calculate and set the overall status
    await updateOverallStatus(request.db, repositoryName)

    return h
      .response({
        message: 'Env test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createEnvTestSuiteController }
