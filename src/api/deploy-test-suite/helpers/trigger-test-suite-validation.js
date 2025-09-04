import Joi from 'joi'
import {
  cpuValidation,
  deploymentIdValidation,
  environmentValidation,
  memoryValidation,
  repositoryNameValidation,
  userWithIdValidation,
  versionValidation
} from '@defra/cdp-validation-kit'

const triggerTestSuiteValidation = Joi.object({
  imageName: repositoryNameValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  deployment: {
    deploymentId: deploymentIdValidation,
    version: versionValidation,
    service: repositoryNameValidation
  }
})

export { triggerTestSuiteValidation }
