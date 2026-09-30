import { statusCodes } from '@defra/cdp-validation-kit'
import Joi from 'joi'
import { entitySubTypes } from '@defra/cdp-validation-kit/src/constants/entities.js'
import { getCpuToMemoryOptions } from '@defra/cdp-validation-kit/src/constants/ecs-cpu-to-memory-options-map.js'

const deployServiceOptionsController = {
  options: {
    validate: {
      query: Joi.object({
        subtype: Joi.string()
          .valid(
            entitySubTypes.frontend,
            entitySubTypes.backend,
            entitySubTypes.prototype
          )
          .optional()
      })
    }
  },
  handler: (request, h) => {
    const ecsCpuToMemoryOptionsMap = getCpuToMemoryOptions(
      request.query.subtype
    )
    const cpuOptions = Object.keys(ecsCpuToMemoryOptionsMap).map((cpu) => ({
      value: Number(cpu),
      text: `${Number(cpu) / 1024} vCPU`
    }))

    return h
      .response({
        cpuOptions,
        ecsCpuToMemoryOptionsMap
      })
      .code(statusCodes.ok)
  }
}

export { deployServiceOptionsController }
