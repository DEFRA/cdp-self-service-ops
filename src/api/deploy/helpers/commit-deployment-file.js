import { config } from '~/src/config'
import { commitFiles } from '~/src/api/deploy/helpers/github/commit-github-files'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

/**
 * @typedef {import("pino").Logger} Logger
 *
 * @param {string} deploymentId
 * @param {{imageName: string, version:string, environment: string, instanceCount: number, cpu: number, memory: number}} payload
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {string} configCommitSha
 * @param {?string} serviceCode
 * @param {Logger} logger
 */
async function commitDeploymentFile(
  deploymentId,
  payload,
  zone,
  user,
  configCommitSha,
  serviceCode,
  logger
) {
  const deployment = generateDeployment(
    user,
    payload,
    zone,
    deploymentId,
    configCommitSha,
    serviceCode,
    false
  )
  const filePath = `environments/${payload.environment}/${zone}/${deployment.service.name}.json`
  const content = [{ path: filePath, obj: deployment }]
  const commitMessage = `${deployment.service.name} ${payload.version} to ${payload.environment}\nInitiated by ${user.displayName}`

  logger.info(`Deployment file ${filePath}`)

  return await commitFiles(
    gitHubOwner,
    deploymentRepo,
    'main',
    commitMessage,
    content
  )
}

function generateDeployment(
  user,
  payload,
  zone,
  deploymentId,
  commitSha,
  serviceCode,
  deploy
) {
  return {
    deploymentId,
    deploy,
    service: {
      name: payload.imageName,
      image: payload.imageName,
      version: payload.version,
      configuration: {
        commitSha
      },
      serviceCode
    },
    cluster: {
      environment: payload.environment,
      zone
    },
    resources: {
      instanceCount: payload.instanceCount,
      cpu: payload.cpu,
      memory: payload.memory
    },
    metadata: {
      user: {
        userId: user.id,
        displayName: user.displayName
      },
      deploymentEnvironment: process.env.ENVIRONMENT
    }
  }
}

export { commitDeploymentFile }
