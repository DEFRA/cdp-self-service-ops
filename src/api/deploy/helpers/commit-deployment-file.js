import { config } from '~/src/config/index.js'
import { commitFile } from '~/src/api/deploy/helpers/github/commit-github-file.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

/**
 * @typedef {import("pino").Logger} Logger
 * @param {string} deploymentId
 * @param {{imageName: string, version:string, environment: string, instanceCount: number, cpu: number, memory: number}} payload
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {string} configCommitSha
 * @param {?string} serviceCode
 * @param {?boolean} deploy
 * @param {Logger} logger
 */
async function commitDeploymentFile(
  deploymentId,
  payload,
  zone,
  user,
  configCommitSha,
  serviceCode,
  deploy,
  logger
) {
  const deployment = generateDeployment(
    user,
    payload,
    zone,
    deploymentId,
    configCommitSha,
    serviceCode,
    deploy
  )
  const filePath = `environments/${payload.environment}/${zone}/${deployment.service.name}.json`
  const commitMessage = `${deployment.service.name} ${payload.version} to ${payload.environment}\nInitiated by ${user.displayName}`

  logger.info(`Deployment file ${filePath}`)

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
