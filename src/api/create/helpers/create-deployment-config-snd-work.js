import { appConfig } from '~/src/config'
import { octokit } from '~/src/helpers/oktokit'
import { addDeploymentConfig } from '~/src/api/create/helpers/add-deployment-config'

async function createDeploymentConfigSndWork(imageName, cluster) {
  const filePath = `snd/${cluster}_services.json`

  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: appConfig.get('githubRepoTfService'),
    path: filePath,
    ref: 'main'
  })

  const servicesJson = addDeploymentConfig(data, imageName, cluster, 'snd')

  return [filePath, servicesJson]
}

export { createDeploymentConfigSndWork }
