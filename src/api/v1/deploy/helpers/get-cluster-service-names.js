import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'

// TODO confirm other environment names when they are added to TF Infra
const environmentMap = {
  sandbox: 'snd',
  development: 'dev',
  test: 'test',
  perfTest: 'perf',
  production: 'prod'
}

async function getClusterServiceNames(environment, clusterName) {
  const { data } = await octokit.rest.repos.getContent({
    mediaType: { format: 'raw' },
    owner: appConfig.get('gitHubOrg'),
    repo: appConfig.get('githubRepoTfService'),
    path: `${environmentMap[environment]}/${clusterName}_services.json`,
    ref: 'main'
  })

  const clusterServicesJson = JSON.parse(data)

  return clusterServicesJson
    .map((service) => service?.container_image)
    .filter(Boolean)
}

export { getClusterServiceNames }
