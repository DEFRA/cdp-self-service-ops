import Joi from 'joi'
import {
  commitShaValidation,
  cpuValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  userWithIdValidation,
  versionValidation
} from '@defra/cdp-validation-kit'
import { canAutoDeploy } from '../can-auto-deploy.js'

const autoDeployServiceValidation = Joi.object({
  imageName: repositoryNameValidation,
  version: versionValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  instanceCount: instanceCountValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  configVersion: commitShaValidation
}).custom((payload, helpers) => {
  if (canAutoDeploy(payload)) {
    return payload
  }

  return helpers.message(
    '"environment" must be one of [infra-dev, management, dev, test, perf-test, ext-test]'
  )
})

export { autoDeployServiceValidation }
