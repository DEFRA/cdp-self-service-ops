import { config } from '~/src/config'

async function registerDeployment(
  imageName,
  version,
  environment,
  instanceCount,
  user,
  deploymentId
) {
  const url = `${config.get('portalBackendApiUrl')}/deployments`
  await fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: imageName,
      version,
      environment,
      instanceCount,
      user,
      deploymentId
    })
  })
}

export { registerDeployment }
