import Boom from '@hapi/boom'

import { serviceTemplates } from '~/src/api/create/helpers/service-templates'
import { triggerCreateRepositoryWorkflow } from '~/src/api/create/helpers/trigger-create-repository-workflow'
import { createServiceInfrastructureCode } from '~/src/api/create/helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/create/helpers/create-service-validation-schema'
import { createServiceConfig } from '~/src/api/create/helpers/create-service-config'
import { setupDeploymentConfig } from '~/src/api/create/helpers/setup-deployment-config'

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
    try {
      const serviceType = request?.payload?.serviceType
      const repositoryName = request?.payload?.repositoryName

      const cluster = serviceTemplates[serviceType] ?? null

      if (cluster === null) {
        return Boom.boomify(
          Boom.badData(`Invalid service template: '${serviceType}'`)
        )
      }

      await triggerCreateRepositoryWorkflow(request?.payload)
      await createServiceConfig(repositoryName)
      await createServiceInfrastructureCode(repositoryName)
      await setupDeploymentConfig(repositoryName, '0.1.0', cluster)

      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { createServiceController }
