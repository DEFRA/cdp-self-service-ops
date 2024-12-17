import { config } from '~/src/config/index.js'
import { deleteGithubFile } from '~/src/api/undeploy/helpers/github/delete-github-file.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()
const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {string} environment
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 */
async function removeDeploymentFile(
  undeploymentId,
  imageName,
  environment,
  zone,
  user
) {
  const filePath = `environments/${environment}/${zone}/${imageName}.json`
  const commitMessage = `${imageName} from ${environment}\nInitiated by ${user.displayName}`

  logger.info(`Undeployment file ${filePath}`)

  return await deleteGithubFile(
    gitHubOwner,
    deploymentRepo,
    'main',
    commitMessage,
    filePath
  )
}

export { removeDeploymentFile }
