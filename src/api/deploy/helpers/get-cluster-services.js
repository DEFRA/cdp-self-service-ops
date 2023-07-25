import { octokit } from '~/src/helpers/oktokit'

import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { getSndClusterName } from '~/src/api/deploy/helpers/get-snd-cluster-name'

async function getClusterServices(environment, clusterName) {
  const logger = createLogger()
  let filePath

  // TODO remove once snd has been aligned with other environments
  const tempClusterName =
    environment === 'snd' ? getSndClusterName(clusterName) : clusterName

  // TODO remove once snd has been aligned with other environments
  if (environment === 'snd') {
    filePath = `snd/${tempClusterName}_services.json`
  } else {
    filePath = `environments/${environment}/services/${tempClusterName}_services.json`
  }

  try {
    const { data } = await octokit.rest.repos.getContent({
      mediaType: { format: 'raw' },
      owner: appConfig.get('gitHubOrg'),
      repo: appConfig.get('githubRepoTfService'),
      path: filePath,
      ref: 'main'
    })

    return JSON.parse(data)
  } catch (error) {
    logger.error(error)
    return []
  }
}

export { getClusterServices }
