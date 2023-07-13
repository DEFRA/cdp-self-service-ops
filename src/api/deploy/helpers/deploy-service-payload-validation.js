import Joi from 'joi'

import { environments } from '~/src/config'
import { ecsCpuAndMemorySizes } from '~/src/api/deploy/helpers/ecs-cpu-and-memory-settings'

const memory = () => {
  let memJoi = Joi.number()
  Object.keys(ecsCpuAndMemorySizes).forEach((cpu) => {
    memJoi = memJoi.when('cpu', {
      is: Number.parseInt(cpu),
      then: Joi.number().valid(...ecsCpuAndMemorySizes[cpu])
    })
  })
  return memJoi
}

const cpu = () => {
  return Joi.number().valid(
    ...Object.keys(ecsCpuAndMemorySizes).map((k) => Number.parseInt(k))
  )
}

function deployServicePayloadSchema() {
  return Joi.object({
    imageName: Joi.string().min(1).required(),
    version: Joi.string()
      .pattern(/^v?\d+\.\d+\.\d+$/)
      .required(),
    environment: Joi.string().valid(...Object.values(environments)),
    instances: Joi.number().min(0).max(16).required(),
    cpu: cpu().required(),
    memory: memory().required()
  })
}

export { deployServicePayloadSchema }
