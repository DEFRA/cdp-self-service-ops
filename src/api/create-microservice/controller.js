import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create-microservice/helpers/service-templates'
import { createServiceValidationSchema } from '~/src/api/create-microservice/helpers/create-service-validation-schema'
import { createServiceConfig } from '~/src/api/create-microservice/helpers/create-service-config'
import { createNginxConfig } from '~/src/api/create-microservice/helpers/create-nginx-config'
import { config, environments } from '~/src/config'
import { trimPr } from '~/src/api/create-microservice/helpers/trim-pr'
import { triggerWorkflow } from '~/src/helpers/workflow/trigger-workflow'
import { statuses } from '~/src/constants/statuses'
import {
  initCreationStatus,
  updateCreationStatus,
  updateOverallStatus
} from '~/src/api/create-microservice/helpers/save-status'
import { createSquidConfig } from '~/src/helpers/create/create-squid-config'
import { createDashboard } from '~/src/helpers/create/create-dashboard'
import { queueTfSvcInfra } from '~/src/api/create-microservice/helpers/queue-tf-srv-Infra'
import { fetchTeam } from '~/src/helpers/fetch-team'

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

    // queue service infra creation
    await queueTfSvcInfra(
      request.server,
      repositoryName,
      zone,
      team.serviceCodes
    )

    // create the blank repo
    await createRepo(request, repositoryName, payload, team)

    // cdp-app-config
    await updateCdpAppConfig(request, repositoryName, team)

    // cdp-nginx-upstreams
    await updateCdpNginxUpstream(request, repositoryName, zone)

    // cdp-squid-proxy
    await createSquidConfig(request, repositoryName)

    // cdp-grafana-svc
    await createDashboard(request, repositoryName, zone)

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

async function updateCdpAppConfig(request, repositoryName, team) {
  const cdpAppConfig = config.get('gitHubRepoConfig')
  try {
    const createServiceConfigResult = await createServiceConfig(
      repositoryName,
      team
    )
    await updateCreationStatus(request.db, repositoryName, cdpAppConfig, {
      status: statuses.raised,
      pr: trimPr(createServiceConfigResult?.data)
    })
    request.logger.info(
      `Created service config PR for ${repositoryName}: ${createServiceConfigResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, cdpAppConfig, {
      status: statuses.failure,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(`Update cdp-app-config ${repositoryName} failed ${e}`)
  }
}

async function updateCdpNginxUpstream(request, repositoryName, zone) {
  const cdpNginxUpstream = config.get('gitHubRepoNginx')
  try {
    const createNginxConfigResult = await createNginxConfig(
      repositoryName,
      zone,
      environments,
      [] // TODO: support user defined paths?
    )
    await updateCreationStatus(request.db, repositoryName, cdpNginxUpstream, {
      status: statuses.raised,
      pr: trimPr(createNginxConfigResult?.data)
    })
    request.logger.info(
      `Created nginx PR for ${repositoryName}: ${createNginxConfigResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, cdpNginxUpstream, {
      status: statuses.failure,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(
      `Update cdp-nginx-upstreams ${repositoryName} failed ${e}`
    )
  }
}

export { createMicroserviceController }
