import { octokit } from '~/src/helpers/oktokit'
import { appConfig, environments } from '~/src/config'
import { addRepoToGithubOidc } from '~/src/api/create/helpers/add-repo-to-github-oidc'
import { addEcrAndPermissionsSndWork } from '~/src/api/create/helpers/add-ecr-and-permissions-snd-work'
import { addRepoToEcrRepoNames } from '~/src/api/create/helpers/add-repo-to-ecr-repo-names'
import { prepPullRequestFiles } from '~/src/api/create/helpers/prep-pull-request-files'

const currentSetupEnvs = ['management', 'infra-dev'] // TODO remove once other envs have been set up

async function createServiceInfrastructureCode(repoName) {
  const fileRepository = appConfig.get('githubRepoTfServiceInfra')
  const pullRequestFiles = new Map()

  Object.values(environments)
    .filter((env) => currentSetupEnvs.includes(env)) // TODO remove once other envs have been set up
    .map(async (env) => {
      const [ecrFilePath, ecrJson] = await addRepoToEcrRepoNames(repoName, env)
      pullRequestFiles.set(ecrFilePath, ecrJson)

      const [oidcFilePath, oidcJson] = await addRepoToGithubOidc(repoName, env)
      pullRequestFiles.set(oidcFilePath, oidcJson)
    })

  // TODO remove snd work once snd has been aligned with other envs. Snd is a different folder structure to other envs
  const sndWork = await addEcrAndPermissionsSndWork(repoName)
  sndWork.map(([key, value]) => pullRequestFiles.set(key, value))

  await octokit.createPullRequest({
    owner: appConfig.get('gitHubOrg'),
    repo: fileRepository,
    title: `Add ${repoName} to ECR repositories list`,
    body: `Auto generated Pull Request to add ${repoName} to ECR repos and GitHub OIDC lists.`,
    head: `add-${repoName}-to-ecr-repos-${new Date().getTime()}`,
    changes: [
      {
        files: prepPullRequestFiles(pullRequestFiles),
        commit: `🤖 add ${repoName} to ecr repo names list`
      }
    ]
  })
}

export { createServiceInfrastructureCode }
