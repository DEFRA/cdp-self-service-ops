import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'
import { addRepoToPermissionList } from '~/src/api/create/helpers/add-repo-to-permissions'

async function createServicePermissions(repositoryName) {
  const filePath = 'snd/github_oidc.tf'
  const fileRepository = appConfig.get('githubRepoServicePermissions')

  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: filePath,
    ref: 'main'
  })

  const updatedPermission = addRepoToPermissionList(repositoryName, data)

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Add ${repositoryName} to github permission list`,
    body: `Auto generated Pull Request to add ${repositoryName} to the '${filePath}' list.`,
    head: `add-${repositoryName}-to-github-perms-${new Date().getTime()}`,
    changes: [
      {
        files: {
          [filePath]: updatedPermission
        },
        commit: `🤖 add ${repositoryName} to github permissions list`
      }
    ]
  })
}

export { createServicePermissions }
