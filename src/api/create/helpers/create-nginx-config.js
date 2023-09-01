import { appConfig } from '~/src/config'
import { octokit } from '~/src/helpers/oktokit'
import { prepPullRequestFiles } from '~/src/api/create/helpers/prep-pull-request-files'

async function createNginxConfig(
  repositoryName,
  zone,
  environments,
  additionPaths = []
) {
  // TODO: support custom paths
  const cfg = JSON.stringify({
    services: [
      {
        cdp_service_name: repositoryName,
        cdp_service_port: '8085',
        cdp_zone: zone,
        addition_paths: []
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

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: appConfig.get('githubRepoNginx'),
    title: `Add config for ${repositoryName}`,
    body: `Auto generated Pull Request to add nginx config for ${repositoryName}`,
    head: `add-${repositoryName}-config-${new Date().getTime()}`,
    changes: [
      {
        files: prepPullRequestFiles(pullRequestFiles),
        commit: `🤖 add nginx config for ${repositoryName}`
      }
    ]
  })
}

export { createNginxConfig }
