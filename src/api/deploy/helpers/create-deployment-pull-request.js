import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'
import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'
import { updateServices } from '~/src/api/deploy/helpers/update-services'
import { getClusterServices } from '~/src/api/deploy/helpers/get-cluster-services'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookupTenantService'

async function createDeploymentPullRequest({
  imageName,
  version,
  environment,
  instanceCount,
  cpu,
  memory
}) {
  const logger = createLogger()
  const fileRepository = config.get('githubRepoTfService')

  const tenantService = await lookupTenantService(environment, imageName)

  if (tenantService === undefined) {
    throw new Error(`Unable to lookup ${imageName} in tenant services`)
  }

  const zone = tenantService.zone
  const services = await getClusterServices(environment, zone)

  const filePath = `environments/${environment}/services/${zone}_services.json`

  const servicesJson = updateServices(
    services,
    imageName,
    version,
    instanceCount,
    cpu,
    memory,
    environment
  )

  logger.info(
    `Raising PR for deployment of ${imageName}:${version} to the ${environment} environment ${zone} cluster`
  )

  const createPullRequestResponse = await octokit.createPullRequest({
    owner: config.get('gitHubOrg'),
    repo: fileRepository,
    title: `Deploy ${environment}:${zone}:${imageName}:${version}`,
    body: `Auto generated Pull Request to set ${imageName} to use version ${version} in '${filePath}'`,
    head: `deploy-${imageName}-${version}-${new Date().getTime()}`,
    changes: [
      {
        files: {
          [filePath]: servicesJson
        },
        commit: `🤖 Deploy ${imageName}:${version} to the ${environment} environment ${zone} cluster`
      }
    ]
  })

  await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: createPullRequestResponse?.data?.node_id
  })
}

export { createDeploymentPullRequest }
