import { decommissionTriggerWorkflowController } from './controllers/trigger-workflow.js'
import { scaleEcsToZeroController } from './controllers/scale-ecs-to-zero-controller.js'

const decommissionService = {
  plugin: {
    name: 'decommission-service',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/decommission/{entityName}/scale-ecs-to-zero',
          ...scaleEcsToZeroController
        },
        {
          method: 'POST',
          path: '/decommission/{entityName}/trigger-workflow',
          ...decommissionTriggerWorkflowController
        }
      ])
    }
  }
}

export { decommissionService }
