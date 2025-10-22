import { decommissionTriggerWorkflowsController } from './controllers/trigger-workflows.js'
import { scaleEcsToZeroController } from './controllers/scale-ecs-to-zero-controller.js'

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
          path: '/decommission/{serviceName}/scale-ecs-to-zero',
          ...scaleEcsToZeroController
        }
      ])
    }
  }
}

export { decommissionService }
