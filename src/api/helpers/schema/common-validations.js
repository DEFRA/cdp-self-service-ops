import Joi from 'joi'
import { environments } from '~/src/config/index.js'
import { environmentsExceptForProd } from '~/src/config/environments.js'
import { ecsCpuToMemoryOptionsMap } from '~/src/api/deploy/helpers/ecs-cpu-to-memory-options-map.js'
import { buildMemoryValidation } from '~/src/api/deploy/helpers/schema/build-memory-validation.js'

const environmentValidation = Joi.string()
  .valid(...Object.values(environments))
  .required()

const environmentExceptForProdValidation = Joi.string()
  .valid(...environmentsExceptForProd)
  .required()

const currentEnvironmentValidation = Joi.string()
  .valid('local', ...Object.values(environments))
  .required()

const zoneValidation = Joi.string().valid('public', 'protected').required()

const entityStatusValidation = Joi.string()
  .valid('Creating', 'Created')
  .required()

const entityTypeValidation = Joi.string()
  .valid('Microservice', 'TestSuite', 'Repository')
  .required()

const entitySubTypeValidation = Joi.string()
  .valid('Frontend', 'Backend', 'Journey', 'Performance')
  .optional()

const displayNameValidation = Joi.string().required()

const userWithIdValidation = Joi.object({
  id: Joi.string().required(),
  displayName: displayNameValidation
})

const teamValidation = Joi.object({
  teamId: Joi.string().required(),
  name: displayNameValidation
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
const migrationIdValidation = Joi.string().required()
const migrationVersionValidation = Joi.string().required()

const deploymentIdValidation = Joi.string().guid().required()

const repositoryNameValidation = Joi.string()
  .min(1)
  .max(32)
  .required()
  .custom((value, helpers) => {
    if (!/^[a-z0-9-]*$/.test(value)) {
      return helpers.message('Letters and numbers with hyphen separators')
    } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value)) {
      return helpers.message('Start and end with a character')
    } else if (/.*-ddl$/.test(value)) {
      return helpers.message('Must not end with "-ddl"')
    } else {
      return value // Valid input
    }
  }, 'Custom repository name validation')
  .messages({
    'string.empty': 'Enter repository name',
    'string.min': '1 character or more',
    'string.max': '32 characters or less'
  })

const entityValidation = Joi.object({
  name: repositoryNameValidation,
  type: entityTypeValidation,
  subType: entitySubTypeValidation,
  primaryLanguage: Joi.string().optional(),
  created: Joi.date().required(),
  creator: userWithIdValidation,
  teams: Joi.array().items(teamValidation).required(),
  status: entityStatusValidation,
  decommissioned: Joi.object().optional().allow(null)
})

const commitShaValidation = Joi.string().required()

const templateBranchNameValidation = Joi.string().min(1).max(62).optional()

const templateTypeValidation = Joi.string()
  .valid('frontend', 'backend')
  .required()

export {
  commitShaValidation,
  cpuValidation,
  currentEnvironmentValidation,
  deploymentIdValidation,
  entityStatusValidation,
  entitySubTypeValidation,
  entityTypeValidation,
  entityValidation,
  environmentExceptForProdValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  migrationIdValidation,
  migrationVersionValidation,
  repositoryNameValidation,
  runIdValidation,
  teamValidation,
  templateBranchNameValidation,
  templateTypeValidation,
  userWithIdValidation,
  userWithUserIdValidation,
  versionValidation,
  zoneValidation
}
