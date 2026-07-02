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
import { canAutoDeployToProd } from '../can-auto-deploy-to-prod.js'

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
  if (canAutoDeployToProd(payload)) {
    return payload
  }

  return helpers.message(
    '"environment" must be one of [infra-dev, management, dev, test, perf-test, ext-test]'
  )
})

export { autoDeployServiceValidation }
