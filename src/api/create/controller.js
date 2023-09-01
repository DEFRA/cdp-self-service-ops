import { isNull } from 'lodash'
import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create/helpers/service-templates'
import { triggerCreateRepositoryWorkflow } from '~/src/api/create/helpers/trigger-create-repository-workflow'
import { createServiceInfrastructureCode } from '~/src/api/create/helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/create/helpers/create-service-validation-schema'
import { createServiceConfig } from '~/src/api/create/helpers/create-service-config'
import { setupDeploymentConfig } from '~/src/api/create/helpers/setup-deployment-config'
import { createNginxConfig } from '~/src/api/create/helpers/create-nginxconfig'
import { environments } from '~/src/config'

const createServiceController = {
  options: {
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

    await triggerCreateRepositoryWorkflow(payload)
    await createServiceConfig(repositoryName)
    await createServiceInfrastructureCode(repositoryName, zone)
    await createNginxConfig(repositoryName, environments, [])
    await setupDeploymentConfig(repositoryName, '0.1.0', zone)

    return h.response({ message: 'success' }).code(200)
  }
}

export { createServiceController }
