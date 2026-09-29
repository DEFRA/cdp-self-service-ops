import { deployServiceValidation } from '../helpers/schema/deploy-service-validation.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import { deployService } from '../helpers/deploy-service.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import Boom from '@hapi/boom'
import { getCpuToMemoryOptions } from '@defra/cdp-validation-kit/src/constants/ecs-cpu-to-memory-options-map.js'
import { prototypeEnvironments } from '@defra/cdp-validation-kit/src/constants/environments.js'
import { entitySubTypes } from '@defra/cdp-validation-kit/src/constants/entities.js'

export function provideEntity(getEntityName) {
  return async function (request, h) {
    const entityName = getEntityName(request)

    if (entityName) {
      request.app.entity = await getEntity(entityName)
    }

    return h.continue
  }
}

const validateDeploymentOptions = (request, h) => {
  const { subtype } = request.app.entity
  const { cpu, memory, environment } = request.payload

  const cpuToMemoryOptionsMap = getCpuToMemoryOptions(subtype)
  const validMemoryOptions = cpuToMemoryOptionsMap[cpu]

  if (!validMemoryOptions.includes(memory)) {
    throw Boom.badRequest(`memory is not valid for cpu ${cpu}`)
  }

  if (
    subtype === entitySubTypes.prototype &&
    !prototypeEnvironments.includes(environment)
  ) {
    throw Boom.badRequest('environment is not valid for prototype entities')
  }

  return h.continue
}

const deployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployServiceValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    },
    pre: [
      provideEntity((request) => request.payload?.imageName),
      validateDeploymentOptions
    ]
  },
  handler: async (request, h) => {
    const { payload, snsClient, logger, auth } = request
    const user = await getScopedUser(payload.imageName, auth, logger)

    try {
      const result = await deployService(payload, user, snsClient, logger)
      return h.response(result).code(statusCodes.ok)
    } catch (err) {
      logger.error(err)
      return h.response({ message: err }).code(statusCodes.internalError)
    }
  }
}

export { deployServiceController }
