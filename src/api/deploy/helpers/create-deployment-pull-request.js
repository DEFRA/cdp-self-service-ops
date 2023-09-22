import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'
import { updateServices } from '~/src/api/deploy/helpers/update-services'
import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'
import { getCluster } from '~/src/api/deploy/helpers/get-cluster'

async function createDeploymentPullRequest({
  imageName,
  version,
  environment,
  instanceCount,
  cpu,
  memory
}) {
  const logger = createLogger()
  const fileRepository = appConfig.get('githubRepoTfService')

  const publicServices = await getClusterServices(environment, 'public')
  const protectedServices = await getClusterServices(environment, 'protected')

  const { clusterName, clusterServices } = getCluster(
    environment,
    imageName,
    publicServices,
    protectedServices
  )
  const filePath = `environments/${environment}/services/${clusterName}_services.json`

  const servicesJson = updateServices(
    clusterServices,
    imageName,
    version,
    instanceCount,
    cpu,
    memory
  )

  logger.info(
    `Raising PR for deployment of ${imageName}:${version} to the ${environment} environment ${clusterName} cluster`
  )

  const createPullRequestResponse = await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Deploy ${imageName}:${version} to ${clusterName} cluster`,
    body: `Auto generated Pull Request to set ${imageName} to use version ${version} in '${filePath}'`,
    head: `deploy-${imageName}-${version}-${new Date().getTime()}`,
    changes: [
      {
        files: {
          [filePath]: servicesJson
        },
        commit: `🤖 Deploy ${imageName}:${version} to the ${environment} environment ${clusterName} cluster`
      }
    ]
  })

  await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: createPullRequestResponse?.data?.node_id
  })
}

export { createDeploymentPullRequest }
