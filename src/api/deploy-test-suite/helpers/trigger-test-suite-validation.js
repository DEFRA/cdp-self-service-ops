import Joi from 'joi'
import {
  cpuValidation,
  deploymentIdValidation,
  environmentValidation,
  memoryValidation,
  profileValidation,
  repositoryNameValidation,
  userWithIdValidation,
  versionValidation
} from '@defra/cdp-validation-kit'

const triggerTestSuiteValidation = Joi.object({
  testSuite: repositoryNameValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  deployment: {
    deploymentId: deploymentIdValidation,
    version: versionValidation,
    service: repositoryNameValidation
  },
  profile: profileValidation
})

export { triggerTestSuiteValidation }
