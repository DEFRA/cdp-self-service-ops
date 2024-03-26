import { config } from '~/src/config'
import { octokit } from '~/src/helpers/oktokit'
import { createLogger } from '~/src/helpers/logging/logger'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'

async function createNginxConfig(
  repositoryName,
  zone,
  environments,
  additionalLocations = [],
  nginxServerOptions = [],
  vanityUrls = []
) {
  const logger = createLogger()

  const cfg = JSON.stringify({
    services: [
      {
        cdp_service_name: repositoryName,
        cdp_service_port: '8085',
        cdp_zone: zone,
        additional_locations: additionalLocations,
        nginx_server_options: nginxServerOptions,
        vanity_urls: vanityUrls
      }
    ]
  })
  const pullRequestFiles = new Map()

  Object.values(environments).forEach((environment) =>
    pullRequestFiles.set(
      `environments/${environment}/${repositoryName}.json`,
      cfg
    )
  )

  logger.info(`creating nginx config for ${pullRequestFiles.size} environments`)

  const pr = await octokit.createPullRequest({
    owner: config.get('gitHubOrg'),
    repo: config.get('githubRepoNginx'),
    title: `Add config for ${repositoryName}`,
    body: `Auto generated Pull Request to add nginx config for ${repositoryName}`,
    head: `add-${repositoryName}-config-${new Date().getTime()}`,
    changes: [
      {
        files: Object.fromEntries(pullRequestFiles.entries()),
        commit: `🤖 add nginx config for ${repositoryName}`
      }
    ]
  })

  await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: pr.data.node_id
  })

  return pr
}

export { createNginxConfig }
