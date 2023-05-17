import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { octokit } from '~/src/helpers/oktokit'

async function createDeploymentPullRequest(imageName, version, cluster) {
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

  const idx = services.findIndex((d) => d.container_image === imageName)
  if (idx === -1) {
    logger.info(
      `No deploy found for ${imageName} in ${cluster} generating a new one.`
    )
    services.push(createNewDeployment(imageName, version))
  } else {
    services[idx].container_version = version
  }

  // Raise the PR.
  logger.info(services)

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Deploy ${imageName}:${version} to ${cluster} cluster`,
    body: `Auto generated Pull Request to set ${imageName} to use version ${version} in '${filePath}'`,
    head: `deploy-${imageName}-${version}_${new Date().getTime()}`,
    changes: [
      {
        files: {
          [filePath]: JSON.stringify(services, null, 2)
        },
        commit: `🤖 Deploy ${imageName}:${version} to ${cluster} cluster`
      }
    ]
  })
}

function createNewDeployment(imageName, version) {
  return {
    container_image: imageName,
    container_port: 3000,
    container_version: version,
    desired_count: 2,
    healthcheck: `/${imageName}/health`, // TODO remove app name routing prefix once routing has been fixed in AWS
    name: imageName,
    task_cpu: 512,
    task_memory: 1024
  }
}

export { createDeploymentPullRequest }
