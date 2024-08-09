import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create-microservice/helpers/service-templates'
import { createServiceValidationSchema } from '~/src/api/create-microservice/helpers/create-service-validation-schema'
import { config } from '~/src/config'
import {
  initCreationStatus,
  updateOverallStatus
} from '~/src/api/create-microservice/helpers/save-status'
import { createSquidConfig } from '~/src/helpers/create/create-squid-config'
import { createDashboard } from '~/src/helpers/create/create-dashboard'
import { fetchTeam } from '~/src/helpers/fetch-team'
import { createTenantService } from '~/src/helpers/create/create-tenant-service'
import { createAppConfig } from '~/src/helpers/create/create-app-config'
import { createNginxUpstreams } from '~/src/helpers/create/create-nginx-upstreams'
import { createTemplatedRepo } from '~/src/helpers/create/create-templated-repo'

const createMicroserviceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: createServiceValidationSchema(),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const serviceTypeTemplate = payload?.serviceTypeTemplate
    const org = config.get('gitHubOrg')
    const repositoryName = payload?.repositoryName

    const zone = serviceTemplates[serviceTypeTemplate]?.zone
    if (!zone) {
      throw Boom.badData(`Invalid service template: '${serviceTypeTemplate}'`)
    }

    const { team } = await fetchTeam(payload.teamId)
    if (!team?.github) {
      throw Boom.badData(
        `Team ${team.name} does not have a link to a Github team`
      )
    }

    request.logger.info(`Creating service ${repositoryName}`)

    const user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }

    // Set up the initial DB record
    try {
      await initCreationStatus(
        request.db,
        org,
        repositoryName,
        payload,
        zone,
        team,
        user
      )
    } catch (e) {
      request.logger.error(e)
      throw Boom.badData(
        `Repository ${repositoryName} has already been requested or is in progress`
      )
    }

    const topics = [
      'cdp',
      'service',
      serviceTemplates[serviceTypeTemplate]?.language,
      serviceTemplates[serviceTypeTemplate]?.type
    ]

    const promises = [
      // create the blank repo

      createTemplatedRepo(
        request,
        config.get('workflows.createMicroService'),
        repositoryName,
        team,
        topics,
        {
          serviceTypeTemplate
        }
      ),

      // create all the infrastructure
      createTenantService(request, repositoryName, {
        service: repositoryName,
        zone,
        mongo_enabled: zone === 'protected',
        redis_enabled: zone === 'public',
        service_code: team.serviceCodes
      }),

      // cdp-app-config
      createAppConfig(request, repositoryName),

      // cdp-nginx-upstreams
      createNginxUpstreams(request, repositoryName, zone),

      // cdp-squid-proxy
      createSquidConfig(request, repositoryName),

      // cdp-grafana-svc
      createDashboard(request, repositoryName, zone)
    ]

    Promise.all(promises)

    // calculate and set the overall status
    await updateOverallStatus(request.db, repositoryName)

    return h
      .response({
        message: 'Service creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}
/*
async function createRepo(request, repositoryName, payload, team) {
  try {
    const org = config.get('gitHubOrg')
    const serviceTypeTemplate = payload?.serviceTypeTemplate
    const serviceTemplate = serviceTemplates[serviceTypeTemplate]
    const gitHubTopics = [
      'cdp',
      'service',
      serviceTemplate?.language,
      serviceTemplate?.type
    ]

    const result = await triggerWorkflow(
      org,
      config.get('gitHubRepoCreateWorkflows'),
      config.get('createMicroServiceWorkflow'),
      {
        repositoryName,
        serviceTypeTemplate,
        team: team.github,
        additionalGitHubTopics: gitHubTopics.filter(Boolean).toString()
      }
    )

    await updateCreationStatus(request.db, repositoryName, 'createRepository', {
      status: statuses.inProgress,
      url: `https://github.com/${org}/${repositoryName}`,
      result
    })
    request.logger.info(`Created repo ${repositoryName}`)
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, 'createRepository', {
      status: statuses.failure,
      result: e
    })
    request.logger.error(`Created repo ${repositoryName} failed ${e}`)
    request.logger.error(e)
  }
}
*/
export { createMicroserviceController }
