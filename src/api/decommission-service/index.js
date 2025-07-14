import { decommissionTriggerWorkflowsController } from '~/src/api/decommission-service/trigger-workflows.js'
import { deleteDeploymentsAndEcsController } from '~/src/api/decommission-service/delete-deployments-and-ecs.js'
import { scaleEcsToZeroController } from '~/src/api/decommission-service/scale-ecs-to-zero-controller.js'

const decommissionService = {
  plugin: {
    name: 'decommission-service',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/decommission/{serviceName}/trigger-workflows',
          ...decommissionTriggerWorkflowsController
        },
        {
          method: 'POST',
          path: '/decommission/{serviceName}/delete-deployments-and-ecs',
          ...deleteDeploymentsAndEcsController
        },
        {
          method: 'POST',
          path: '/decommission/{serviceName}/scale-ecs-to-zero',
          ...scaleEcsToZeroController
        }
      ])
    }
  }
}

export { decommissionService }
