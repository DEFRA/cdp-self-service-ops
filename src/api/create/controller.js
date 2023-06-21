import Boom from '@hapi/boom'

import { templates } from '~/src/api/create/helpers/service-templates'
import { triggerCreateRepositoryWorkflow } from '~/src/api/create/helpers/trigger-create-repository-workflow'
import { createServiceInfrastructureCode } from '~/src/api/create/helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/create/helpers/create-service-validation-schema'
import { createInitialDeploymentPullRequest } from '~/src/api/create/helpers/add-service-to-deployments'

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
      const cluster = templates[request?.payload?.serviceType]

      if (cluster === null) {
        return Boom.boomify(
          Boom.badData(`invalid template: '${request?.payload?.serviceType}'`)
        )
      }

      await triggerCreateRepositoryWorkflow(request?.payload)
      await createServiceInfrastructureCode(request?.payload?.repositoryName)
      await createInitialDeploymentPullRequest(
        request?.payload?.repositoryName,
        '0.1.0',
        cluster
      )

      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { createServiceController }
