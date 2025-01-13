import { config } from '~/src/config/index.js'

const currentEnvironment = config.get('environment')

/**
 * @param {{deployment: object, user: {id: string, displayName: string}, undeploymentId: string, deploymentEnvironment: ?string}} options
 */
export function scaleDeploymentToZeroInstances({
  deployment,
  user,
  undeploymentId,
  deploymentEnvironment = currentEnvironment
}) {
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
        userId: user.userId ?? user.id,
        displayName: user.displayName
      },
      deploymentEnvironment
    }
  }
}
