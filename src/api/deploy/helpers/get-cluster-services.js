import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'

async function getClusterServices(environment, cluster) {
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

  return JSON.parse(data)
}

export { getClusterServices }
