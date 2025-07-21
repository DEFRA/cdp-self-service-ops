import { config } from '../../config/index.js'
import { commitFile } from '../github/commit-github-file.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

/**
 * @param {{deploymentId: string, deploy: boolean, service: {name: string, version: string, configuration: {commitSha: string}}, cluster: {environment: string, zone: string}, resources: {memory: number, cpu: number, instanceCount: number}, metadata: {user: {userId: string, displayName: string}, deploymentEnvironment: ?string}}} deployment
 * @param {import("pino").Logger} logger
 */
export async function commitDeploymentFile(deployment, logger) {
  const {
    service: { name, version },
    cluster: { environment, zone },
    metadata: { user }
  } = deployment
  const filePath = `environments/${environment}/${zone}/${name}.json`
  const commitMessage = `${name} ${version} to ${environment}\nInitiated by ${user.displayName}`

  return await commitFile(
    gitHubOwner,
    deploymentRepo,
    'main',
    commitMessage,
    filePath,
    deployment,
    logger
  )
}
