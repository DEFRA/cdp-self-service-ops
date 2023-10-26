import { octokit } from '~/src/helpers/oktokit'
import { config, environments } from '~/src/config'
import { prepPullRequestFiles } from '~/src/api/createV2/helpers/prep-pull-request-files'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'

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

  const pr = await octokit.createPullRequest({
    owner: config.get('gitHubOrg'),
    repo: config.get('githubRepoConfig'),
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

  await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: pr.data.node_id
  })

  return pr
}

export { createServiceConfig }
