import { octokit } from '~/src/helpers/oktokit'
import { config, environments } from '~/src/config'
import { prepPullRequestFiles } from '~/src/api/createV2/helpers/prep-pull-request-files'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

async function createServiceConfig(repositoryName, team) {
  const configPlaceholderText = `# Config for ${repositoryName}, settings should be in KEY=value format`
  const pullRequestFiles = new Map()

  // add placeholders for service defaults
  pullRequestFiles.set(
    `services/${repositoryName}/defaults.env`,
    configPlaceholderText
  )

  // add placeholders for each environment
  Object.values(environments).forEach((environment) =>
    pullRequestFiles.set(
      `services/${repositoryName}/${environment}/${repositoryName}.env`,
      configPlaceholderText
    )
  )

  // update code owners
  try {
    const updatedCodeOwners = updateCodeOwners(repositoryName, team.github)
    pullRequestFiles.set('.github/CODEOWNERS', updatedCodeOwners)
  } catch (e) {
    logger.error(e)
  }

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

const updateCodeOwners = async (repositoryName, teamGithubName) => {
  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: config.get('gitHubOrg'),
    repo: config.get('githubRepoConfig'),
    path: '.github/CODEOWNERS',
    ref: 'main'
  })

  if (data && teamGithubName) {
    return `${data}\n/services/${repositoryName}/ @defra/${teamGithubName}`
  }
  throw new Error(
    `Unable to update code owners for ${repositoryName} @defra/${teamGithubName}`
  )
}

export { createServiceConfig }
