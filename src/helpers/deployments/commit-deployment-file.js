import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { commitFile } from '~/src/helpers/github/commit-github-file.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

/**
 * @param {{deployment: {deploymentId: string, deploy: boolean, service: {name: string, version: string, configuration: {commitSha: string}}, cluster: {environment: string, zone: string}, resources: {memory: number, cpu: number, instanceCount: number}, metadata: {user: {userId: string, displayName: string}, deploymentEnvironment: ?string}}, owner: string, repo: string, logger: import('pino').Logger}} options
 */
export async function commitDeploymentFile({
  deployment: {
    deploymentId,
    deploy,
    service,
    resources,
    cluster,
    metadata: { user, deploymentEnvironment = process.env.ENVIRONMENT }
  },
  owner = gitHubOwner,
  repo = deploymentRepo,
  logger = createLogger()
}) {
  const filePath = `environments/${cluster.environment}/${cluster.zone}/${service.name}.json`
  const commitMessage = `${service.name} ${service.version} to ${cluster.environment}\nInitiated by ${user.displayName}`

  const content = {
    deploymentId,
    deploy,
    service: {
      ...service,
      image: service.name
    },
    resources,
    cluster,
    metadata: {
      user,
      deploymentEnvironment
    }
  }

  return await commitFile({
    owner,
    repo,
    branch: 'main',
    commitMessage,
    filePath,
    content,
    logger
  })
}
