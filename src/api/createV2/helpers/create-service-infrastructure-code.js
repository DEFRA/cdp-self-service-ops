import { octokit } from '~/src/helpers/oktokit'
import { config, environments } from '~/src/config'
import { addRepoToGithubOidc } from '~/src/api/createV2/helpers/add-repo-to-github-oidc'
import { addRepoToTenantServices } from '~/src/api/createV2/helpers/add-repo-to-tenant-services'
import { prepPullRequestFiles } from '~/src/api/createV2/helpers/prep-pull-request-files'
import { readyEnvironments } from '~/src/config/ready-environments'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'

async function createServiceInfrastructureCode(repoName, zone) {
  const fileRepository = config.get('githubRepoTfServiceInfra')
  const pullRequestFiles = new Map()

  const infrastructurePromises = Object.values(environments)
    .filter((env) => readyEnvironments.includes(env)) // TODO remove filter once other envs have been set up
    .map(async (env) => {
      const [tenantServicesFilePath, tenantServicesJson] =
        await addRepoToTenantServices(repoName, env, zone)
      pullRequestFiles.set(tenantServicesFilePath, tenantServicesJson)

      const [oidcFilePath, oidcJson] = await addRepoToGithubOidc(repoName, env)
      pullRequestFiles.set(oidcFilePath, oidcJson)
    })

  await Promise.all(infrastructurePromises)

  const pr = await octokit.createPullRequest({
    owner: config.get('gitHubOrg'),
    repo: fileRepository,
    title: `Add ${repoName} to Tenant Services list`,
    body: `Auto generated Pull Request to add ${repoName} to Tenant Services and GitHub OIDC lists.`,
    head: `add-${repoName}-to-tenant-services-${new Date().getTime()}`,
    changes: [
      {
        files: prepPullRequestFiles(pullRequestFiles),
        commit: `🤖 add ${repoName} to Tenant Services and GitHub OIDC lists`
      }
    ]
  })

  await octokit.graphql(enableAutoMergeGraphQl, {
    pullRequestId: pr.data.node_id
  })

  return pr
}

export { createServiceInfrastructureCode }
