import { decommissionServiceController } from '~/src/api/decommission-service/controller.js'
import { decommissionTriggerWorkflowsController } from '~/src/api/decommission-service/trigger-workflows.js'
import { deleteDeploymentsAndEcsController } from '~/src/api/decommission-service/delete-deployments-and-ecs.js'

const decommissionService = {
  plugin: {
    name: 'decommission-service',
    register: async (server) => {
      await server.route([
        {
          method: 'DELETE',
          path: '/decommission/{serviceName}',
          ...decommissionServiceController
        },
        {
          method: 'POST',
          path: '/decommission/{serviceName}/trigger-workflows',
          ...decommissionTriggerWorkflowsController
        },
        {
          method: 'POST',
          path: '/decommission/{serviceName}/delete-deployments-and-ecs',
          ...deleteDeploymentsAndEcsController
        }
      ])
    }
  }
}

export { decommissionService }
