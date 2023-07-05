import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'

async function getClusterServiceNames(environment, cluster) {
  let filePath

  // TODO remove once snd has been aligned with other environments
  if (environment === 'snd') {
    filePath = `${environment}/${cluster}_services.json`
  } else {
    filePath = `environments/${environment}/services/${cluster}_services.json`
  }

  const { data } = await octokit.rest.repos.getContent({
    mediaType: { format: 'raw' },
    owner: appConfig.get('gitHubOrg'),
    repo: appConfig.get('githubRepoTfService'),
    path: filePath,
    ref: 'main'
  })

  const clusterServicesJson = JSON.parse(data)

  return clusterServicesJson
    .map((service) => service?.container_image)
    .filter(Boolean)
}

export { getClusterServiceNames }
