import { config } from '~/src/config'
import { fetcher } from '~/src/helpers/fetcher'

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
  const url = `${config.get('portalBackendUrl')}/v2/deployments`
  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: imageName,
      version,
      environment,
      instanceCount,
      cpu: cpu.toString(),
      memory: memory.toString(),
      user,
      deploymentId,
      configVersion: latestConfigCommitSha
    })
  })
}

export { registerDeployment }
