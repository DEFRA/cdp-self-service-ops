import { isNull } from 'lodash'
import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create/helpers/service-templates'
import { createServiceInfrastructureCode } from '~/src/api/create/helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/create/helpers/create-service-validation-schema'
import { createServiceConfig } from '~/src/api/create/helpers/create-service-config'
import { createNginxConfig } from '~/src/api/create/helpers/create-nginx-config'
import { config, environments } from '~/src/config'
import {
  initCreationStatus,
  updateCreationStatus
} from '~/src/api/create/helpers/save-status'
import { authStrategy } from '~/src/helpers/auth-stratergy'
import { trimPr } from '~/src/api/create/helpers/trim-pr'

const createServiceController = {
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
    const repositoryName = payload?.repositoryName

    const zone = serviceTemplates[serviceType] ?? null

    if (isNull(zone)) {
      throw Boom.badData(`Invalid service template: '${serviceType}'`)
    }

    await initCreationStatus(request.db, repositoryName, payload, zone)

    request.logger.info(`creating service ${repositoryName}`)

    // Create the infra entries (tenant-services.json) to provision things like the ECR repo and iam roles
    // This will be auto-merged assuming the checks pass, triggering the subsequent PR's to also be merged
    // and the github repo to be created (see ~/listners/github/message-handler.js)

    // cdp-tf-svc-infra
    const createServiceInfrastructureCodeResult =
      await createServiceInfrastructureCode(repositoryName, zone)
    request.logger.info(
      `created service infra PR for ${repositoryName}: ${createServiceInfrastructureCodeResult.data.html_url}`
    )
    await updateCreationStatus(
      request.db,
      repositoryName,
      config.get('githubRepoTfServiceInfra'),
      {
        status: 'raised',
        pr: trimPr(createServiceInfrastructureCodeResult?.data)
      }
    )

    // cdp-app-config
    const createServiceConfigResult = await createServiceConfig(repositoryName)

    await updateCreationStatus(
      request.db,
      repositoryName,
      config.get('githubRepoConfig'),
      {
        status: 'raised',
        pr: trimPr(createServiceConfigResult?.data)
      }
    )
    request.logger.info(
      `created service config PR for ${repositoryName}: ${createServiceConfigResult.data.html_url}`
    )

    // cdp-nginx-upstreams
    const createNginxConfigResult = await createNginxConfig(
      repositoryName,
      zone,
      environments,
      [] // TODO: support user defined paths?
    )
    await updateCreationStatus(
      request.db,
      repositoryName,
      config.get('githubRepoNginx'),
      {
        status: 'raised',
        pr: trimPr(createNginxConfigResult?.data)
      }
    )
    request.logger.info(
      `created nginx PR for ${repositoryName}: ${createNginxConfigResult.data.html_url}`
    )

    return h
      .response({
        message: 'Service creation has started',
        repositoryName,
        statusUrl: `/create-service/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createServiceController }
