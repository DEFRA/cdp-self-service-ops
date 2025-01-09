import { config } from '~/src/config/index.js'
import { commitFile } from '~/src//helpers/github/commit-github-file.js'
import { findRunningDetails } from '~/src/helpers/deployments/find-running-details.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')
const currentEnvironment = config.get('environment')

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {string} environment
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {import('pino').Logger} logger
 */
async function scaleEcsToZero({
  imageName,
  environment,
  zone,
  user,
  undeploymentId,
  logger
}) {
  logger.info(`Scaling ECS to ZERO for ${imageName} in env ${environment}`)
  const filePath = `environments/${environment}/${zone}/${imageName}.json`

  const runningDetails = await findRunningDetails(imageName, environment)

  if (!runningDetails) {
    logger.info(
      `Deployment details not found for ${imageName} in ${environment}, may not be running`
    )
    return
  }

  const undeployment = changeDeploymentToZeroInstances(
    undeploymentId,
    runningDetails,
    imageName,
    environment,
    zone,
    user
  )

  const commitMessage = `Scaling to 0 ${imageName} from ${environment}\nInitiated by ${user.displayName}`

  await commitFile(
    gitHubOwner,
    deploymentRepo,
    'main',
    commitMessage,
    filePath,
    undeployment,
    logger
  )

  logger.info('ECS Service scaled to 0')
}

/**
 * @param {string} undeploymentId
 * @param {object} existingDeployment
 * @param {string} imageName
 * @param {string} environment
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 */
function changeDeploymentToZeroInstances(
  undeploymentId,
  existingDeployment,
  imageName,
  environment,
  zone,
  user
) {
  return {
    deploymentId: undeploymentId,
    deploy: true,
    service: {
      name: imageName,
      image: imageName,
      version: existingDeployment.version,
      configuration: {
        commitSha: existingDeployment.configVersion
      }
    },
    cluster: {
      environment,
      zone
    },
    resources: {
      memory: existingDeployment.memory,
      cpu: existingDeployment.cpu,
      instanceCount: 0
    },
    metadata: {
      deploymentEnvironment: currentEnvironment,
      user
    }
  }
}

export { scaleEcsToZero }
