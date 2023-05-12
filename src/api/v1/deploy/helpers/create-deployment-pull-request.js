import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { octokit } from '~/src/helpers/oktokit'

async function createDeploymentPullRequest(image, version, cluster) {
  const logger = createLogger()
  const filePath = `snd/${cluster}_services.json`
  const fileRepository = appConfig.get('githubRepoDeployments')

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

  const idx = services.findIndex((d) => d.container_image === image)
  if (idx === -1) {
    logger.info(
      `No deploy found for ${image} in ${cluster} generating a new one.`
    )
    services.push(createNewDeployment(image, version))
  } else {
    services[idx].container_version = version
  }

  // Raise the PR.
  logger.info(services)

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Deploy ${image}:${version} to ${cluster} cluster`,
    body: `Auto generated Pull Request to set ${image} to use version ${version} in '${filePath}'`,
    head: `deploy-${image}-${version}_${new Date().getTime()}`,
    changes: [
      {
        files: {
          [filePath]: JSON.stringify(services, null, 2)
        },
        commit: `🤖 Deploy ${image}:${version} to ${cluster} cluster`
      }
    ]
  })
}

function createNewDeployment(image, version) {
  return {
    container_image: image,
    container_port: 3000,
    container_version: version,
    desired_count: 2,
    healthcheck: '/health',
    name: image,
    task_cpu: 512,
    task_memory: 1024
  }
}

export { createDeploymentPullRequest }
