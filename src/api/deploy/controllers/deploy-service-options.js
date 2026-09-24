import {
  ecsCpuToMemoryOptionsMap,
  prototypeCpuToMemoryOptionsMap
} from '../helpers/ecs-cpu-to-memory-options-map.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import Joi from 'joi'
import { entitySubTypes } from '@defra/cdp-validation-kit/src/constants/entities.js'

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
    return h
      .response({
        cpuOptions: [
          { value: 512, text: '0.5 vCPU' },
          { value: 1024, text: '1 vCPU' },
          { value: 2048, text: '2 vCPU' },
          { value: 4096, text: '4 vCPU' },
          { value: 8192, text: '8 vCPU' }
        ],
        ecsCpuToMemoryOptionsMap:
          request.query.subtype === entitySubTypes.prototype
            ? prototypeCpuToMemoryOptionsMap
            : ecsCpuToMemoryOptionsMap
      })
      .code(statusCodes.ok)
  }
}

export { deployServiceOptionsController }
