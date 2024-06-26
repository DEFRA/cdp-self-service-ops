import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'
import { getContent } from '~/src/helpers/gitHub/get-content'

async function getClusterServices(environment, clusterName) {
  const logger = createLogger()
  const filePath = `environments/${environment}/services/${clusterName}_services.json`

  try {
    const owner = config.get('gitHubOrg')
    const repo = config.get('githubRepoTfService')
    const data = await getContent(owner, repo, filePath)
    return JSON.parse(data)
  } catch (error) {
    logger.error(error)
    return []
  }
}

export { getClusterServices }
