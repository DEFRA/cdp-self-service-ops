import { undeployServiceValidation } from '~/src/api/undeploy/helpers/schema/undeploy-service-validation.js'
import {
  deleteEcsTask,
  deleteAllEcsTask
} from '~/src/api/undeploy/helpers/delete-ecs-task.js'

const deleteEcsTaskController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: undeployServiceValidation()
    }
  },
  handler: async (request, h) => {
    const { imageName, environment } = request.params

    await deleteEcsTask({
      serviceName: imageName,
      environment,
      logger: request.logger
    })
    return h.response({ message: 'success' }).code(204)
  }
}

const deleteAllEcsTasksController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: undeployServiceValidation()
    }
  },
  handler: async (request, h) => {
    const { imageName } = request.params

    await deleteAllEcsTask({
      serviceName: imageName,
      logger: request.logger
    })
    return h.response({ message: 'success' }).code(204)
  }
}

export { deleteEcsTaskController, deleteAllEcsTasksController }
