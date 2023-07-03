import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { octokit } from '~/src/helpers/oktokit'

async function createInitialDeploymentPullRequest(imageName, version, cluster) {
  const logger = createLogger()
  const env = 'snd' // TODO: pass this in from the request
  const filePath = `${env}/${cluster}_services.json`
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
    services.push(createNewDeployment(imageName, '0.1.0', cluster, env))
  } else {
    logger.info(`service ${imageName} is already deployed in this cluster`)
    return
  }

  // Raise the PR.
  logger.info(services)

  await octokit.createPullRequest({
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
        commit: `🤖 Initial deploy ${imageName}:${version} to ${cluster} cluster`
      }
    ]
  })
}

function createNewDeployment(imageName, version, cluster, env) {
  return {
    container_image: imageName,
    container_port: 8085,
    container_version: version,
    desired_count: 1,
    healthcheck: `/${imageName}/health`, // TODO remove app name routing prefix once routing has been fixed in AWS
    name: imageName,
    task_cpu: 1024,
    task_memory: 2048,
    env_files: [
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/global/global_${cluster}_fixed.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/services/${imageName}/${env}/${imageName}.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/services/${imageName}/defaults.env`,
        type: 's3'
      },
      {
        value: `arn:aws:s3:::cdp-snd-service-configs/environments/${env}/defaults.env`,
        type: 's3'
      }
    ]
  }
}

export { createInitialDeploymentPullRequest }
