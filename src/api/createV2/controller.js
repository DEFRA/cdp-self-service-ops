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
import { createGithubRepo } from '~/src/api/createV2/helpers/create-github-repo'

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

    const zone = serviceTemplates[serviceType] ?? null

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
        message: 'success',
        statusUrl: `/create-service/status/${repositoryName}`
      })
      .code(200)
  }
}

const doCreateRepo = async (request, repositoryName, payload) => {
  try {
    const repoCreationResult = await createGithubRepo(payload)
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
      status: 'failed',
      result: e
    })
    request.logger.error(`created repo ${repositoryName} failed ${e}`)
    request.logger.error(e)
  }
}

const doUpdateTfSvcInfra = async (request, repositoryName, zone) => {
  try {
    const createServiceInfrastructureCodeResult =
      await createServiceInfrastructureCode(repositoryName, zone)
    await updateCreationStatus(request.db, repositoryName, 'tf-svc-infra', {
      status: 'raised',
      pr: trimPr(createServiceInfrastructureCodeResult?.data)
    })
    request.logger.info(
      `created service infra PR for ${repositoryName}: ${createServiceInfrastructureCodeResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, 'tf-svc-infra', {
      status: 'failed',
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(`update tf-svc-infra ${repositoryName} failed ${e}`)
  }
}

const doUpdateCdpAppConfig = async (request, repositoryName) => {
  try {
    const createServiceConfigResult = await createServiceConfig(repositoryName)
    await updateCreationStatus(request.db, repositoryName, 'cdp-app-config', {
      status: 'raised',
      pr: trimPr(createServiceConfigResult?.data)
    })
    request.logger.info(
      `created service config PR for ${repositoryName}: ${createServiceConfigResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, 'cdp-app-config', {
      status: 'failed',
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(`update cdp-app-config ${repositoryName} failed ${e}`)
  }
}

const doUpdateCdpNginxUpstream = async (request, repositoryName, zone) => {
  try {
    const createNginxConfigResult = await createNginxConfig(
      repositoryName,
      zone,
      environments,
      [] // TODO: support user defined paths?
    )
    await updateCreationStatus(
      request.db,
      repositoryName,
      'cdp-nginx-upstreams',
      {
        status: 'raised',
        pr: trimPr(createNginxConfigResult?.data)
      }
    )
    request.logger.info(
      `created nginx PR for ${repositoryName}: ${createNginxConfigResult.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(
      request.db,
      repositoryName,
      'cdp-nginx-upstreams',
      {
        status: 'failed',
        result: e?.response ?? 'see cdp-self-service-ops logs'
      }
    )
    request.logger.error(
      `update cdp-nginx-upstreams ${repositoryName} failed ${e}`
    )
  }
}

export { createServiceV2Controller }
