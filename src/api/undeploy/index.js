import { deleteDeploymentFilesController } from '~/src/api/undeploy/controllers/delete-deployment-file.js'
import {
  deleteEcsServiceController,
  deleteAllEcsServicesController
} from '~/src/api/undeploy/controllers/delete-ecs-service.js'
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
          ...deleteEcsServiceController
        },
        {
          method: 'DELETE',
          path: '/delete-ecs/{imageName}',
          ...deleteAllEcsServicesController
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
