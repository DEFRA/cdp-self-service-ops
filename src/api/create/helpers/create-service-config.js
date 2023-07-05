import { octokit } from '~/src/helpers/oktokit'
import { appConfig, environments } from '~/src/config'
import { prepPullRequestFiles } from '~/src/api/create/helpers/prep-pull-request-files'

async function createServiceConfig(repositoryName) {
  const configPlaceholderText = `# Config for ${repositoryName}, settings should be in KEY=value format`
  const pullRequestFiles = new Map()

  pullRequestFiles.set(
    `services/${repositoryName}/defaults.env`,
    configPlaceholderText
  )

  Object.values(environments).forEach((environment) =>
    pullRequestFiles.set(
      `services/${repositoryName}/${environment}/${repositoryName}.env`,
      configPlaceholderText
    )
  )

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: appConfig.get('githubRepoAppConfig'),
    title: `Add base config for ${repositoryName}`,
    body: `Auto generated Pull Request to add default config for ${repositoryName}`,
    head: `add-${repositoryName}-config-${new Date().getTime()}`,
    changes: [
      {
        files: prepPullRequestFiles(pullRequestFiles),
        commit: `🤖 add placeholder config for ${repositoryName}`
      }
    ]
  })
}

export { createServiceConfig }