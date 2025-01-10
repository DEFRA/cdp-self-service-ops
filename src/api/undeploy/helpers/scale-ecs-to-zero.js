import { config } from '~/src/config/index.js'
import { commitFile } from '~/src//helpers/github/commit-github-file.js'
import { findRunningDetails } from '~/src/helpers/deployments/find-running-details.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')
const currentEnvironment = config.get('environment')

/**
 * @param {{serviceName: string, environment: string, zone: string, user: {id: string, displayName: string}, undeploymentId: string, logger: import('pino').Logger}} options
 */
async function scaleEcsToZero({
  serviceName,
  environment,
  zone,
  user,
  undeploymentId,
  logger
}) {
  logger.info(`Scaling ECS to ZERO for ${serviceName} in env ${environment}`)
  const filePath = `environments/${environment}/${zone}/${serviceName}.json`

  const runningDetails = await findRunningDetails(serviceName, environment)

  if (!runningDetails) {
    logger.info(
      `Deployment details not found for ${serviceName} in ${environment}, may not be running`
    )
    return
  }

  const undeployment = changeDeploymentToZeroInstances(
    runningDetails,
    serviceName,
    environment,
    zone,
    user,
    undeploymentId
  )

  const commitMessage = `Scaling to 0 ${serviceName} from ${environment}\nInitiated by ${user.displayName}`

  await commitFile({
    owner: gitHubOwner,
    repo: deploymentRepo,
    branch: 'main',
    commitMessage,
    filePath,
    content: undeployment,
    logger
  })

  logger.info('ECS Service scaled to 0')
}

/**
 * @param {object} runningDetails
 * @param {string} serviceName
 * @param {string} environment
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 */
function changeDeploymentToZeroInstances(
  runningDetails,
  serviceName,
  environment,
  zone,
  user,
  undeploymentId
) {
  return {
    deploymentId: undeploymentId,
    deploy: true,
    service: {
      name: serviceName,
      image: serviceName,
      version: runningDetails.version,
      configuration: {
        commitSha: runningDetails.configVersion
      }
    },
    cluster: {
      environment,
      zone
    },
    resources: {
      memory: runningDetails.memory,
      cpu: runningDetails.cpu,
      instanceCount: 0
    },
    metadata: {
      deploymentEnvironment: currentEnvironment,
      user
    }
  }
}

export { scaleEcsToZero }
