import { octokit } from '~/src/helpers/oktokit'
import { appConfig } from '~/src/config'
import { addRepositoryName } from '~/src/api/v1/create/helpers/add-repository-name'

async function createServiceInfrastructureCode(repositoryName) {
  const filePath = 'snd/ecr_repo_names.json'
  const fileRepository = 'tf-svc-infra'

  const { data } = await octokit.rest.repos.getContent({
    mediaType: {
      format: 'raw'
    },
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    path: filePath,
    ref: 'main'
  })

  const repositoryNamesJson = addRepositoryName({
    repositories: data,
    fileRepository,
    filePath,
    repositoryName
  })

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Add ${repositoryName} to ECR repositories list`,
    body: `Auto generated Pull Request to add ${repositoryName} to the '${filePath}' list.`,
    head: `add-${repositoryName}-to-ecr-repos`,
    changes: [
      {
        files: {
          filePath: repositoryNamesJson
        },
        commit: `🤖 add ${repositoryName} to ecr repo names list`
      }
    ]
  })
}

export { createServiceInfrastructureCode }
