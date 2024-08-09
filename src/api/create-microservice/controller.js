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
import { creations } from '~/src/constants/creations'

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
    const org = config.get('github.org')
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

    // Set up the initial DB record
    try {
      await initCreationStatus(
        request.db,
        org,
        creations.microservice,
        repositoryName,
        serviceTypeTemplate,
        zone,
        team,
        request.auth?.credentials,
        [
          config.get('github.repos.createWorkflows'),
          config.get('github.repos.cdpTfSvcInfra'),
          config.get('github.repos.cdpAppConfig'),
          config.get('github.repos.cdpNginxUpstreams'),
          config.get('github.repos.cdpSquidProxy'),
          config.get('github.repos.cdpGrafanaSvc')
        ]
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

    // trigger all the workflows
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

    await Promise.all(promises)

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

export { createMicroserviceController }
