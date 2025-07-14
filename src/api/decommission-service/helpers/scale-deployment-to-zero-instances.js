import { config } from '~/src/config/index.js'

const deploymentEnvironment = config.get('environment')

/**
 * @param {object} deployment
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 */
export function scaleDeploymentToZeroInstances(
  deployment,
  user,
  undeploymentId
) {
  return {
    ...deployment,
    deploymentId: undeploymentId,
    resources: {
      ...deployment.resources,
      instanceCount: 0
    },
    metadata: {
      ...deployment.metadata,
      user: {
        userId: user.id,
        displayName: user.displayName
      },
      deploymentEnvironment
    }
  }
}
