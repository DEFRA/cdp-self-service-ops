import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'
import { addRepositoryName } from '~/src/api/v1/create/helpers/add-repository-name'
import { addRepoToPermissions } from '~/src/api/v1/create/helpers/add-repo-to-permissions'

async function createServiceInfrastructureCode(repositoryName) {
  const fileRepository = appConfig.get('githubRepoServiceInfra')

  const ecrRepoNamesFilePath = 'snd/ecr_repo_names.json'
  const ecrRepoNamesData = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: ecrRepoNamesFilePath,
    ref: 'main'
  })

  const repositoryNamesJson = addRepositoryName({
    repositories: ecrRepoNamesData.data,
    fileRepository,
    filePath: ecrRepoNamesFilePath,
    repositoryName
  })

  const githubPermissionsFilePath = 'snd/github_oidc_repositories.json'
  const githubPermissionsData = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: githubPermissionsFilePath,
    ref: 'main'
  })

  const githubPermissionsJson = addRepoToPermissions({
    permissions: githubPermissionsData.data,
    fileRepository,
    filePath: githubPermissionsFilePath,
    repositoryName,
    org: appConfig.get('gitHubOrg')
  })

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Add ${repositoryName} to ECR repositories list`,
    body: `Auto generated Pull Request to add ${repositoryName} to the '${ecrRepoNamesFilePath}' list.`,
    head: `add-${repositoryName}-to-ecr-repos-${new Date().getTime()}`,
    changes: [
      {
        files: {
          [ecrRepoNamesFilePath]: repositoryNamesJson,
          [githubPermissionsFilePath]: githubPermissionsJson
        },
        commit: `🤖 add ${repositoryName} to ecr repo names list`
      }
    ]
  })
}

export { createServiceInfrastructureCode }
