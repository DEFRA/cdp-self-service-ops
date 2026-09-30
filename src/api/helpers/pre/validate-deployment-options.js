import { getCpuToMemoryOptions } from '@defra/cdp-validation-kit/src/constants/ecs-cpu-to-memory-options-map.js'
import { prototypeEnvironments } from '@defra/cdp-validation-kit/src/constants/environments.js'
import { entitySubTypes } from '@defra/cdp-validation-kit/src/constants/entities.js'
import Boom from '@hapi/boom'

export const validateDeploymentOptions = (request, h) => {
  const { subtype } = request.app.entity
  const { cpu, memory, environment } = request.payload

  const cpuToMemoryOptionsMap = getCpuToMemoryOptions(subtype)
  const validMemoryOptions = cpuToMemoryOptionsMap[cpu]

  if (!validMemoryOptions.some((option) => option.value === memory)) {
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
