import { config } from '~/src/config'
import { commitFiles } from '~/src/api/deploy/helpers/github/commit-github-files'

const deploymentRepo = config.get('gitHubRepoTfService')
const gitHubOwner = config.get('gitHubOrg')

async function commitDeploymentFile(
  deploymentId,
  payload,
  zone,
  user,
  configCommitSha
) {
  const deployment = generateDeployment(
    user,
    payload,
    deploymentId,
    configCommitSha,
    false
  )
  const filePath = `environments/${payload.environment}/${zone}/${deployment.service.name}.json`
  const content = [{ path: filePath, obj: deployment }]
  const commitMessage = `Deploy ${deployment.service.name} ${payload.version} to ${payload.environment} - Initiated by ${user.displayName}`

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
  deploymentId,
  commitSha,
  deploy = true
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
      }
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
      }
    }
  }
}

export { commitDeploymentFile }
