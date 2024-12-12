import { config } from '~/src/config/index.js'
import { deleteGithubFile } from '~/src/api/undeploy/helpers/github/delete-github-file.js'

const deploymentRepo = config.get('github.repos.appDeployments')
const gitHubOwner = config.get('github.org')

/**
 * @typedef {import("pino").Logger} Logger
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {string} environment
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {Logger} logger
 */
async function removeDeploymentFile(
  undeploymentId,
  imageName,
  environment,
  zone,
  user,
  logger
) {
  const filePath = `environments/${environment}/${zone}/${imageName}.json`
  const commitMessage = `${imageName} from ${environment}\nInitiated by ${user.displayName}`

  logger.info(`Undeployment file ${filePath}`)

  return await deleteGithubFile(
    gitHubOwner,
    deploymentRepo,
    'main',
    commitMessage,
    filePath,
    logger
  )
}

export { removeDeploymentFile }
