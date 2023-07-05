import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMergeGraphQl } from '~/src/api/deploy/graphql/enable-automerge.graphql'
import { updateServices } from '~/src/api/deploy/helpers/update-services'

async function createDeploymentPullRequest({
  imageName,
  version,
  environment,
  cluster
}) {
  const logger = createLogger()
  const fileRepository = appConfig.get('githubRepoTfService')
  let filePath

  // TODO remove once snd has been aligned with other environments
  if (environment === 'snd') {
    filePath = `${environment}/${cluster}_services.json`
  } else {
    filePath = `environments/${environment}/services/${cluster}_services.json`
  }

  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: filePath,
    ref: 'main'
  })

  const servicesJson = updateServices(data, imageName, version)

  logger.info(
    `Raising PR for deployment of ${imageName}:${version} to the ${environment} environment ${cluster} cluster`
  )

  const createPullRequestResponse = await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Deploy ${imageName}:${version} to ${cluster} cluster`,
    body: `Auto generated Pull Request to set ${imageName} to use version ${version} in '${filePath}'`,
    head: `deploy-${imageName}-${version}-${new Date().getTime()}`,
    changes: [
      {
        files: {
          [filePath]: servicesJson
        },
        commit: `🤖 Deploy ${imageName}:${version} to the ${environment} environment ${cluster} cluster`
      }
    ]
  })

  await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: createPullRequestResponse?.data?.node_id
  })
}

export { createDeploymentPullRequest }
