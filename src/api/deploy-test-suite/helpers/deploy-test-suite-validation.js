import Joi from 'joi'
import {
  cpuValidation,
  environmentValidation,
  memoryValidation,
  profileValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'

const deployTestSuiteValidation = Joi.object({
  testSuite: repositoryNameValidation,
  environment: environmentValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  profile: profileValidation
})

export { deployTestSuiteValidation }
