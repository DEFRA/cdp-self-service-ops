import { octokit } from '~/src/helpers/oktokit'
import { appConfig, environments } from '~/src/config'
import { createDeploymentConfig } from '~/src/api/create/helpers/create-deployment-config'
import { prepPullRequestFiles } from '~/src/api/create/helpers/prep-pull-request-files'
import { readyEnvironments } from '~/src/config/ready-environments'

async function setupDeploymentConfig(imageName, version, clusterName) {
  const fileRepository = appConfig.get('githubRepoTfService')
  const pullRequestFiles = new Map()

  const deploymentConfigPromises = Object.values(environments)
    .filter((env) => readyEnvironments.includes(env)) // TODO remove filter once other envs have been set up
    .map(async (env) => {
      const [filePath, servicesJson] = await createDeploymentConfig(
        imageName,
        clusterName,
        env
      )

      pullRequestFiles.set(filePath, servicesJson)
    })

  await Promise.all(deploymentConfigPromises)

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Setup deployment config for ${imageName}:${version} to ${clusterName} cluster`,
    body: `Auto generated Pull Request to set ${imageName} to use version ${version} in all environments`,
    head: `deploy-${imageName}-${version}-${new Date().getTime()}`,
    changes: [
      {
        files: prepPullRequestFiles(pullRequestFiles),
        commit: `🤖 Initial deploy ${imageName}:${version} to ${clusterName} cluster`
      }
    ]
  })
}

export { setupDeploymentConfig }
