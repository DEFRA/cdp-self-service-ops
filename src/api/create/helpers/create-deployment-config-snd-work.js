import { appConfig } from '~/src/config'
import { octokit } from '~/src/helpers/oktokit'
import { addDeploymentConfig } from '~/src/api/create/helpers/add-deployment-config'
import { getSndClusterName } from '~/src/api/deploy/helpers/get-snd-cluster-name'

async function createDeploymentConfigSndWork(imageName, clusterName) {
  const tempClusterName = getSndClusterName(clusterName)
  const filePath = `snd/${tempClusterName}_services.json`

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
      tempClusterName,
      'snd'
    )

    return [filePath, servicesJson]
  } catch (error) {
    return []
  }
}

export { createDeploymentConfigSndWork }
