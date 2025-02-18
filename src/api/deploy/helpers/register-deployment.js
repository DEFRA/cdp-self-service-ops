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
} from '~/src/api/helpers/schema/common-validations.js'
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
  latestConfigCommitSha
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
    configVersion: latestConfigCommitSha
  }

  Joi.assert(body, registerDeploymentValidation)

  const url = `${config.get('portalBackendUrl')}/v2/deployments`
  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export { registerDeployment }
