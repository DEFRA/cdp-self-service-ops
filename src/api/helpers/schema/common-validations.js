import Joi from 'joi'
import { environments } from '~/src/config/index.js'
import { ecsCpuToMemoryOptionsMap } from '~/src/api/deploy/helpers/ecs-cpu-to-memory-options-map.js'
import { buildMemoryValidation } from '~/src/api/deploy/helpers/schema/build-memory-validation.js'

const environmentValidation = Joi.string()
  .valid(...Object.values(environments))
  .required()

const currentEnvironmentValidation = Joi.string()
  .valid('local', ...Object.values(environments))
  .required()

const zoneValidation = Joi.string().valid('public', 'protected').required()

const displayNameValidation = Joi.string().required()

const userWithIdValidation = Joi.object({
  id: Joi.string().required(),
  displayName: displayNameValidation
})

const userWithUserIdValidation = Joi.object({
  userId: Joi.string().required(),
  displayName: displayNameValidation
})

const validCpuValues = Object.keys(ecsCpuToMemoryOptionsMap).map((cpu) =>
  Number.parseInt(cpu)
)

const memoryValidation = buildMemoryValidation().required()

const versionValidation = Joi.string()
  .pattern(/^\d+\.\d+\.\d+$/)
  .required()

const instanceCountValidation = Joi.number().min(0).max(10).required()

const cpuValidation = Joi.number()
  .valid(...validCpuValues)
  .required()

const runIdValidation = Joi.string().guid().required()
const deploymentIdValidation = Joi.string().guid().required()

const repositoryNameValidation = Joi.string()
  .pattern(/^[\w-]*$/)
  .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, {
    name: 'startAndEndWithCharacter'
  })
  .min(1)
  .max(32)
  .required()
  .messages({
    'string.empty': 'Enter repository name',
    'string.pattern.base': 'Letters and numbers with hyphen separators',
    'string.pattern.name': 'Start and end with a character',
    'string.min': '1 character or more',
    'string.max': '32 characters or less'
  })

export {
  cpuValidation,
  currentEnvironmentValidation,
  deploymentIdValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  runIdValidation,
  userWithIdValidation,
  userWithUserIdValidation,
  versionValidation,
  zoneValidation
}
