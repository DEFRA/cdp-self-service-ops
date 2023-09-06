import { appConfig } from '~/src/config'
import { octokit } from '~/src/helpers/oktokit'

async function createNginxConfig(
  repositoryName,
  zone,
  environments,
  additionPaths = []
) {
  const cfg = JSON.stringify({
    services: [
      {
        cdp_service_name: repositoryName,
        cdp_service_port: '8085',
        cdp_zone: zone,
        addition_paths: additionPaths
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

  return await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: appConfig.get('githubRepoNginx'),
    title: `Add config for ${repositoryName}`,
    body: `Auto generated Pull Request to add nginx config for ${repositoryName}`,
    head: `add-${repositoryName}-config-${new Date().getTime()}`,
    changes: [
      {
        files: pullRequestFiles,
        commit: `🤖 add nginx config for ${repositoryName}`
      }
    ]
  })
}

export { createNginxConfig }
