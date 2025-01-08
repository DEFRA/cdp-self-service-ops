import { config } from '~/src/config/index.js'
import { commitFile } from '~/src//helpers/github/commit-github-file.js'
import { getExistingDeployment } from '~/src/api/deploy/helpers/get-existing-deployment.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {string} environment
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {import('pino').Logger} logger
 */
async function scaleEcsToZero(
  undeploymentId,
  imageName,
  environment,
  zone,
  user,
  logger
) {
  logger.info(`Scaling ECS to ZERO for ${imageName} in env ${environment}`)
  const filePath = `environments/${environment}/${zone}/${imageName}.json`

  const existingDeployment = await getExistingDeployment(
    gitHubOwner,
    deploymentRepo,
    filePath
  )

  if (!existingDeployment) {
    logger.info(`Deployment file not found for ${imageName} in ${environment}`)
    return
  }

  const undeployment = changeDeploymentToZeroInstances(
    user,
    undeploymentId,
    existingDeployment
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
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 * @param {object} existingDeployment
 */
function changeDeploymentToZeroInstances(
  user,
  undeploymentId,
  existingDeployment
) {
  return {
    ...existingDeployment,
    deploymentId: undeploymentId,
    resources: {
      ...existingDeployment.resources,
      instanceCount: 0
    },
    metadata: {
      ...existingDeployment.metadata,
      user: {
        userId: user.id,
        displayName: user.displayName
      }
    }
  }
}

export { scaleEcsToZero }
