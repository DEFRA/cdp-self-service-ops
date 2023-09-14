import { isNull } from 'lodash'
import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create/helpers/service-templates'
import { triggerCreateRepositoryWorkflow } from '~/src/api/create/helpers/trigger-create-repository-workflow'
import { createServiceInfrastructureCode } from '~/src/api/create/helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/create/helpers/create-service-validation-schema'
import { createServiceConfig } from '~/src/api/create/helpers/create-service-config'
import { setupDeploymentConfig } from '~/src/api/create/helpers/setup-deployment-config'
import { createNginxConfig } from '~/src/api/create/helpers/create-nginx-config'
import { appConfig, environments } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'

const createServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [appConfig.get('azureAdminGroupId'), '{params.teamId}']
      }
    },
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
    const logger = createLogger()

    const payload = request?.payload
    const serviceType = payload?.serviceType
    const repositoryName = payload?.repositoryName

    const zone = serviceTemplates[serviceType] ?? null

    if (isNull(zone)) {
      throw Boom.badData(`Invalid service template: '${serviceType}'`)
    }

    logger.info(`creating service ${repositoryName}`)

    await triggerCreateRepositoryWorkflow(payload)
    logger.info(`triggered create service workflow for ${repositoryName}`)

    const createServiceConfigResult = await createServiceConfig(repositoryName)
    logger.info(
      `created service config PR for ${repositoryName}: ${createServiceConfigResult.data.html_url}`
    )

    const createServiceInfrastructureCodeResult =
      await createServiceInfrastructureCode(repositoryName, zone)
    logger.info(
      `created service infra PR for ${repositoryName}: ${createServiceInfrastructureCodeResult.data.html_url}`
    )
    const setupDeploymentConfigResult = await setupDeploymentConfig(
      repositoryName,
      '0.1.0',
      zone
    )
    logger.info(
      `created deployment PR for ${repositoryName}: ${setupDeploymentConfigResult.data.html_url}`
    )

    const createNginxConfigResult = await createNginxConfig(
      repositoryName,
      zone,
      environments,
      [] // TODO: support user defined paths?
    )
    logger.info(
      `created nginx PR for ${repositoryName}: ${createNginxConfigResult.data.html_url}`
    )

    return h.response({ message: 'success' }).code(200)
  }
}

export { createServiceController }
