import { octokit } from '~/src/helpers/oktokit'

import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { addDeploymentConfig } from '~/src/api/create/helpers/add-deployment-config'

async function createDeploymentConfig(imageName, clusterName, environment) {
  const logger = createLogger()
  const filePath = `environments/${environment}/services/${clusterName}_services.json`

  try {
    const { data } = await octokit.rest.repos.getContent({
      mediaType: {
        format: 'raw'
      },
      owner: appConfig.get('gitHubOrg'),
      repo: appConfig.get('githubRepoTfService'),
      path: filePath,
      ref: 'main'
    })

    const servicesJson = addDeploymentConfig(
      data,
      imageName,
      clusterName,
      environment
    )

    return [filePath, servicesJson]
  } catch (error) {
    logger.error(error)
    return []
  }
}

export { createDeploymentConfig }
