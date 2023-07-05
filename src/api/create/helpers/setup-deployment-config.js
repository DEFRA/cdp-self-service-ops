import { octokit } from '~/src/helpers/oktokit'
import { appConfig, environments } from '~/src/config'
import { createDeploymentConfigSndWork } from '~/src/api/create/helpers/create-deployment-config-snd-work'
import { createDeploymentConfig } from '~/src/api/create/helpers/create-deployment-config'
import { prepPullRequestFiles } from '~/src/api/create/helpers/prep-pull-request-files'

const currentSetupEnvs = ['management'] // TODO remove once other envs have been set up

async function setupDeploymentConfig(imageName, version, cluster) {
  const fileRepository = appConfig.get('githubRepoTfService')
  const pullRequestFiles = new Map()

  Object.values(environments)
    .filter((env) => currentSetupEnvs.includes(env)) // TODO remove once other envs have been set up
    .map(async (env) => {
      const [filePath, servicesJson] = await createDeploymentConfig(
        imageName,
        cluster,
        env
      )

      pullRequestFiles.set(filePath, servicesJson)
    })

  // TODO remove snd work once snd has been aligned with other envs. Snd is a different folder structure to other envs
  const [sndFilePath, sndServicesJson] = await createDeploymentConfigSndWork(
    imageName,
    cluster
  )

  pullRequestFiles.set(sndFilePath, sndServicesJson)

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Setup deployment config for ${imageName}:${version} to ${cluster} cluster`,
    body: `Auto generated Pull Request to set ${imageName} to use version ${version} in all environments`,
    head: `deploy-${imageName}-${version}-${new Date().getTime()}`,
    changes: [
      {
        files: prepPullRequestFiles(pullRequestFiles),
        commit: `🤖 Initial deploy ${imageName}:${version} to ${cluster} cluster`
      }
    ]
  })
}

export { setupDeploymentConfig }
