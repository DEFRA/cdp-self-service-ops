import { octokit } from '~/src/helpers/oktokit'

import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'

async function getClusterServices(environment, clusterName) {
  const logger = createLogger()
  const filePath = `environments/${environment}/services/${clusterName}_services.json`

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
