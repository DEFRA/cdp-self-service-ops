import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { updateCreationStatus } from '~/src/api/create-microservice/helpers/save-status'
import { trimPr } from '~/src/api/create-microservice/helpers/trim-pr'
import { octokit } from '~/src/helpers/oktokit'
import { enableAutoMergeGraphQl } from '~/src/helpers/graphql/enable-automerge.graphql'
import { createLogger } from '~/src/helpers/logging/logger'
import { prepPullRequestFiles } from '~/src/api/create-microservice/helpers/prep-pull-request-files'
import { addRepoToGitHubOidc } from '~/src/api/create-microservice/helpers/add-repo-to-github-oidc'
import { getContent } from '~/src/helpers/github/get-content'

/**
 *
 * @param  request {Request}
 * @param name {string}
 * @param zone {string}
 * @param environments {[string]}
 * @returns {Promise<void>}
 */
const raiseInfraPullRequest = async (request, name, zone, environments) => {
  const tfSvcInfra = config.get('gitHubRepoTfServiceInfra')
  try {
    const tfSvcInfraPr = await createTestSuiteInfrastructureCode(
      name,
      zone,
      environments
    )

    await updateCreationStatus(request.db, name, tfSvcInfra, {
      status: statuses.raised,
      pr: trimPr(tfSvcInfraPr?.data)
    })
    request.logger.info(
      `created test suite infra PR for ${name}: ${tfSvcInfraPr.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, name, tfSvcInfra, {
      status: statuses.failure,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(`update cdp-tf-svc-infra ${name} failed ${e}`)
  }
}

async function createTestSuiteInfrastructureCode(repoName, zone, environments) {
  const fileRepository = config.get('gitHubRepoTfServiceInfra')
  const pullRequestFiles = new Map()

  const infrastructurePromises = environments.map(async (env) => {
    const [tenantServicesFilePath, tenantServicesJson] =
      await addTestToTenantServices(repoName, env, zone)
    pullRequestFiles.set(tenantServicesFilePath, tenantServicesJson)

    const [oidcFilePath, oidcJson] = await addRepoToGitHubOidc(repoName, env)
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

async function addTestToTenantServices(repositoryName, environment, zone) {
  const logger = createLogger()
  const fileRepository = config.get('gitHubRepoTfServiceInfra')
  const filePath = `environments/${environment}/resources/tenant_services.json`
  const owner = config.get('gitHubOrg')

  try {
    const data = await getContent(owner, fileRepository, filePath)
    const parsedRepositories = JSON.parse(data)

    if (parsedRepositories[0][repositoryName] === undefined) {
      parsedRepositories[0][repositoryName] = {
        zone,
        mongo: false,
        redis: false,
        testSuite: repositoryName
      }
    } else {
      logger.warn(
        `There's already and entry for '${repositoryName} in ${environment} cdp-tf-svc-infra! We wont overwrite it.`
      )
    }
    const repositoryNamesJson = JSON.stringify(parsedRepositories, null, 2)

    return [filePath, repositoryNamesJson]
  } catch (error) {
    logger.error(error)
    return []
  }
}

export { raiseInfraPullRequest }
