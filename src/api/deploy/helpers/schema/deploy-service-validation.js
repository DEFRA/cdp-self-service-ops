import Joi from 'joi'

import { environments } from '~/src/config/index.js'
import { ecsCpuToMemoryOptionsMap } from '~/src/api/deploy/helpers/ecs-cpu-to-memory-options-map.js'
import { buildMemoryValidation } from '~/src/api/deploy/helpers/schema/build-memory-validation.js'

const validCpuValues = Object.keys(ecsCpuToMemoryOptionsMap).map((cpu) =>
  Number.parseInt(cpu)
)

const memoryValidation = buildMemoryValidation().required()

const imageNameValidation = Joi.string().min(1).required()

const versionValidation = Joi.string()
  .pattern(/^\d+\.\d+\.\d+$/)
  .required()

const environmentValidation = Joi.string()
  .valid(...Object.values(environments))
  .required()

const instanceCountValidation = Joi.number().min(0).max(10).required()

const cpuValidation = Joi.number()
  .valid(...validCpuValues)
  .required()

function deployServiceValidation() {
  return Joi.object({
    imageName: imageNameValidation,
    version: versionValidation,
    environment: environmentValidation,
    instanceCount: instanceCountValidation,
    cpu: cpuValidation,
    memory: memoryValidation
  })
}

const deploymentValidation = Joi.object({
  deploymentId: Joi.string().required(),
  deploy: Joi.boolean().required(),
  service: Joi.object({
    name: imageNameValidation,
    image: imageNameValidation,
    version: versionValidation,
    configuration: Joi.object({
      commitSha: Joi.string().required()
    }),
    serviceCode: Joi.string()
  }),
  cluster: Joi.object({
    environment: environmentValidation,
    zone: Joi.string().required()
  }),
  resources: Joi.object({
    instanceCount: instanceCountValidation,
    cpu: cpuValidation,
    memory: memoryValidation
  }),
  metadata: Joi.object({
    user: Joi.object({
      userId: Joi.string().required(),
      displayName: Joi.string().required()
    }),
    deploymentEnvironment: Joi.string().required()
  })
})

export { deployServiceValidation, deploymentValidation }
