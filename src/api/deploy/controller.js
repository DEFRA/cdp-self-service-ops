import Boom from '@hapi/boom'

import { deployServicePayloadSchema } from '~/src/api/deploy/helpers/deploy-service-payload-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'
import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'
import {ecsCpuAndMemorySizes} from "~/src/api/deploy/helpers/ecs-cpu-and-memory-settings";

const deployServiceController = {
  options: {
    validate: {
      payload: deployServicePayloadSchema()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    try {
      await createDeploymentPullRequest({
        ...request.payload
      })

      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

const deploymentInfoController = {
  options: {},
  handler: async (request, h) => {
    const env = request.params.env

    const frontendServices = await getClusterServices(env, 'frontend')
    const backendServices = await getClusterServices(env, 'backend')

    return h
      .response({
        frontends: frontendServices,
        backends: backendServices
      })
      .code(200)
  }
}

const deploymentInfoForServiceController = {
  options: {},
  handler: async (request, h) => {
    const env = request.params.env
    const service = request.params.service

    // TODO: cache these results in redis etc instead of polling them every time
    const backendServices = await getClusterServices(env, 'backend')
    let res = backendServices.find((s) => s.container_image === service)

    if (!res) {
      const frontendServices = await getClusterServices(env, 'frontend')
      res = frontendServices.find((s) => s.container_image === service)
    }

    if (!res) {
      return h
        .response({ message: `service ${service} was not found` })
        .code(404)
    }

    return h.response(res).code(200)
  }
}

const validEcsCpuAndMemoryController = {
  options: {},
  handler: async (request, h) => {
    return h.response(ecsCpuAndMemorySizes).code(200)
  }
}

export {
  deployServiceController,
  deploymentInfoController,
  deploymentInfoForServiceController,
  validEcsCpuAndMemoryController
}
