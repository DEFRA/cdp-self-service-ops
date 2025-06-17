import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import {
  cpuValidation,
  deploymentIdValidation,
  environmentValidation,
  instanceCountValidation,
  memoryValidation,
  repositoryNameValidation,
  userWithIdValidation,
  versionValidation
} from '@defra/cdp-validation-kit/src/validations.js'
import Joi from 'joi'

const registerDeploymentValidation = Joi.object({
  service: repositoryNameValidation,
  version: versionValidation,
  environment: environmentValidation,
  instanceCount: instanceCountValidation,
  cpu: cpuValidation,
  memory: memoryValidation,
  user: userWithIdValidation,
  deploymentId: deploymentIdValidation,
  configVersion: Joi.string().min(1).required()
})

async function registerDeployment(
  imageName,
  version,
  environment,
  instanceCount,
  cpu,
  memory,
  user,
  deploymentId,
  configVersion
) {
  const body = {
    service: imageName,
    version,
    environment,
    instanceCount,
    cpu: cpu.toString(),
    memory: memory.toString(),
    user,
    deploymentId,
    configVersion
  }

  Joi.assert(body, registerDeploymentValidation)

  const url = `${config.get('portalBackendUrl')}/deployments`
  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export { registerDeployment }
