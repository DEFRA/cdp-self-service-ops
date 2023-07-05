import { appConfig } from '~/src/config'
import { octokit } from '~/src/helpers/oktokit'
import { addDeploymentConfig } from '~/src/api/create/helpers/add-deployment-config'

async function createDeploymentConfig(imageName, cluster, environment) {
  const filePath = `environments/${environment}/services/${cluster}_services.json`

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
    cluster,
    environment
  )

  return [filePath, servicesJson]
}

export { createDeploymentConfig }
