import { deleteDeploymentFilesController } from '~/src/api/undeploy/controllers/delete-deployment-file.js'
import {
  deleteEcsTaskController,
  deleteAllEcsTasksController
} from '~/src/api/undeploy/controllers/delete-ecs-task.js'
import {
  undeployServiceFromAllEnvironmentController,
  undeployServiceFromEnvironmentController
} from '~/src/api/undeploy/controllers/undeploy-service.js'

const undeploy = {
  plugin: {
    name: 'undeploy',
    register: async (server) => {
      await server.route([
        {
          method: 'DELETE',
          path: '/delete-ecs/{imageName}/{environment}',
          ...deleteEcsTaskController
        },
        {
          method: 'DELETE',
          path: '/delete-ecs/{imageName}',
          ...deleteAllEcsTasksController
        },
        {
          method: 'POST',
          path: '/scale-to-zero/{serviceName}',
          ...undeployServiceFromAllEnvironmentController
        },
        {
          method: 'POST',
          path: '/scale-to-zero/{serviceName}/{environment}',
          ...undeployServiceFromEnvironmentController
        },
        {
          method: 'DELETE',
          path: '/delete-deployment-files/{serviceName}',
          ...deleteDeploymentFilesController
        }
      ])
    }
  }
}

export { undeploy }
