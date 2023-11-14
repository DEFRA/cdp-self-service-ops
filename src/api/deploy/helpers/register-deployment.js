import { config } from '~/src/config'

async function registerDeployment(imageName, version, environment, user) {
  const url = `${config.get('portalBackendApiUrl')}/deployments`
  await fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: imageName,
      version,
      environment,
      user
    })
  })
}

export { registerDeployment }
