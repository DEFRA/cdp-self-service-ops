import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'

async function createServiceConfig(repositoryName, environments) {
  const fileRepository = appConfig.get('githubRepoAppConfig')

  const placeholderConfig = `# Config for ${repositoryName}, settings should be in KEY=value format`
  const files = {
    [`services/${repositoryName}/defaults.env`]: placeholderConfig
  }

  environments.forEach((env) => {
    files[`services/${repositoryName}/${env}/${repositoryName}.env`] =
      placeholderConfig
  })
  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Add base config for ${repositoryName}`,
    body: `Auto generated Pull Request to add default config for ${repositoryName}`,
    head: `add-${repositoryName}-config-${new Date().getTime()}`,
    changes: [
      {
        files,
        commit: `🤖 add placeholder config for ${repositoryName}`
      }
    ]
  })
}

export { createServiceConfig }
