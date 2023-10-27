import { isNull } from 'lodash'
import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/createV2/helpers/service-templates'
import { createServiceInfrastructureCode } from '~/src/api/createV2/helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/createV2/helpers/create-service-validation-schema'
import { createServiceConfig } from '~/src/api/createV2/helpers/create-service-config'
import { createNginxConfig } from '~/src/api/createV2/helpers/create-nginx-config'
import { config, environments } from '~/src/config'
import {
  initCreationStatus,
  updateCreationStatus,
  updateOverallStatus
} from '~/src/api/createV2/helpers/save-status'
import { authStrategy } from '~/src/helpers/auth-stratergy'
import { trimPr } from '~/src/api/createV2/helpers/trim-pr'
import { createServiceFromTemplate } from '~/src/api/createV2/helpers/create-service-from-template'

const createServiceV2Controller = {
  options: {
    auth: authStrategy,
    validate: {
      payload: createServiceValidationSchema()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const serviceType = payload?.serviceType
    const org = config.get('gitHubOrg')
    const repositoryName = payload?.repositoryName

    const zone = serviceTemplates[serviceType]?.zone ?? null

    if (isNull(zone)) {
      throw Boom.badData(`Invalid service template: '${serviceType}'`)
    }

    request.logger.info(`creating service v2 ${repositoryName}`)

    // Setup the initial DB record
    await initCreationStatus(request.db, org, repositoryName, payload, zone)

    // create the blank repo
    await doCreateRepo(request, repositoryName, payload)

    // tf-svc-infra
    await doUpdateTfSvcInfra(request, repositoryName, zone)

    // cdp-app-config
    await doUpdateCdpAppConfig(request, repositoryName)

    // cdp-nginx-upstreams
    await doUpdateCdpNginxUpstream(request, repositoryName, zone)

    // calculate and set the overall status
    await updateOverallStatus(request.db, repositoryName)

    return h
      .response({
        message: `${repositoryName} service creation has started`,
        repositoryName,
        statusUrl: `/create-service/status/${repositoryName}`
      })
      .code(200)
  }
}

const doCreateRepo = async (request, repositoryName, payload) => {
  try {
    const org = config.get('gitHubOrg')
    const repoName = payload.repositoryName
    const teamName = payload.owningTeam
    const templateRepo = payload?.serviceType
    const templateName = serviceTemplates[templateRepo]?.templateName ?? null

    const repoCreationResult = await createServiceFromTemplate(
      org,
      repoName,
      teamName,
      templateRepo,
      templateName
    )
    await updateCreationStatus(request.db, repositoryName, 'createRepository', {
      status: 'created',
      url: repoCreationResult.data.html_url,
      result: repoCreationResult.data
    })
    request.logger.info(
      `created repo ${repositoryName} ${repoCreationResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, 'createRepository', {
      status: 'failure',
      result: e
    })
    request.logger.error(`created repo ${repositoryName} failed ${e}`)
    request.logger.error(e)
  }
}

const doUpdateTfSvcInfra = async (request, repositoryName, zone) => {
  const tfSvcInfra = config.get('githubRepoTfServiceInfra')
  try {
    const createServiceInfrastructureCodeResult =
      await createServiceInfrastructureCode(repositoryName, zone)
    await updateCreationStatus(request.db, repositoryName, tfSvcInfra, {
      status: 'raised',
      pr: trimPr(createServiceInfrastructureCodeResult?.data)
    })
    request.logger.info(
      `created service infra PR for ${repositoryName}: ${createServiceInfrastructureCodeResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, tfSvcInfra, {
      status: 'failure',
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(
      `update cdp-tf-svc-infra ${repositoryName} failed ${e}`
    )
  }
}

const doUpdateCdpAppConfig = async (request, repositoryName) => {
  const cdpAppConfig = config.get('githubRepoConfig')
  try {
    const createServiceConfigResult = await createServiceConfig(repositoryName)
    await updateCreationStatus(request.db, repositoryName, cdpAppConfig, {
      status: 'raised',
      pr: trimPr(createServiceConfigResult?.data)
    })
    request.logger.info(
      `created service config PR for ${repositoryName}: ${createServiceConfigResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, cdpAppConfig, {
      status: 'failure',
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(`update cdp-app-config ${repositoryName} failed ${e}`)
  }
}

const doUpdateCdpNginxUpstream = async (request, repositoryName, zone) => {
  const cdpNginxUpstream = config.get('githubRepoNginx')
  try {
    const createNginxConfigResult = await createNginxConfig(
      repositoryName,
      zone,
      environments,
      [] // TODO: support user defined paths?
    )
    await updateCreationStatus(request.db, repositoryName, cdpNginxUpstream, {
      status: 'raised',
      pr: trimPr(createNginxConfigResult?.data)
    })
    request.logger.info(
      `created nginx PR for ${repositoryName}: ${createNginxConfigResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, cdpNginxUpstream, {
      status: 'failure',
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(
      `update cdp-nginx-upstreams ${repositoryName} failed ${e}`
    )
  }
}

export { createServiceV2Controller }
