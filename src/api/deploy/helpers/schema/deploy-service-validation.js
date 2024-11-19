import Joi from 'joi'

import { environments } from '~/src/config/index.js'
import { ecsCpuToMemoryOptionsMap } from '~/src/api/deploy/helpers/ecs-cpu-to-memory-options-map.js'
import { buildMemoryValidation } from '~/src/api/deploy/helpers/schema/build-memory-validation.js'

const validCpuValues = Object.keys(ecsCpuToMemoryOptionsMap).map((cpu) =>
  Number.parseInt(cpu)
)

const memoryValidation = buildMemoryValidation()

function deployServiceValidation() {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    version: Joi.string()
      .pattern(/^\d+\.\d+\.\d+$/)
      .required(),
    environment: Joi.string()
      .valid(...Object.values(environments))
      .required(),
    instanceCount: Joi.number().min(0).max(10).required(),
    cpu: Joi.number()
      .valid(...validCpuValues)
      .required(),
    memory: memoryValidation.required()
  })
}

export { deployServiceValidation }
