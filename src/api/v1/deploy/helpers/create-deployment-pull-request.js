import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMerge } from '~/src/api/v1/deploy/graphql/enable-automerge.graphql'

async function createDeploymentPullRequest(imageName, version, cluster) {
  const logger = createLogger()
  const filePath = `snd/${cluster}_services.json`
  const fileRepository = appConfig.get('githubRepoTfService')

  // get the current deployment
  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: filePath,
    ref: 'main'
  })

  // TODO: validate the content
  const services = JSON.parse(data)

  const idx = services.findIndex((d) => d.container_image === imageName)
  if (idx === -1) {
    throw new Error(`service ${imageName} is not deployed in this cluster!`)
  } else {
    services[idx].container_version = version
  }

  logger.info(
    `Raising PR for deployment of ${imageName}:${version} to the ${cluster} cluster`
  )

  const response = await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Deploy ${imageName}:${version} to ${cluster} cluster`,
    body: `Auto generated Pull Request to set ${imageName} to use version ${version} in '${filePath}'`,
    head: `deploy-${imageName}-${version}-${new Date().getTime()}`,
    changes: [
      {
        files: {
          [filePath]: JSON.stringify(services, null, 2)
        },
        commit: `🤖 Deploy ${imageName}:${version} to ${cluster} cluster`
      }
    ]
  })
 
  return await octokit.graphql(enableAutoMerge, {pullRequestId: response.data.node_id})
}

export { createDeploymentPullRequest }
