/**
 * @param {{imageName: string, version:string, environment: string, instanceCount: number, cpu: number, memory: number}} payload
 * @param {string} zone
 * @param {string} deploymentId
 * @param {string} commitSha
 * @param {?string} serviceCode
 * @param {?boolean} deploy
 * @param {{id: string, displayName: string}} user
 */
export function generateDeployment(
  { imageName, version, environment, instanceCount, cpu, memory },
  zone,
  deploymentId,
  commitSha,
  serviceCode,
  deploy,
  user
) {
  return {
    deploymentId,
    deploy,
    service: {
      name: imageName,
      image: imageName,
      version,
      configuration: {
        commitSha
      },
      serviceCode
    },
    cluster: {
      environment,
      zone
    },
    resources: {
      instanceCount,
      cpu,
      memory
    },
    metadata: {
      user: {
        userId: user.userId ?? user.id,
        displayName: user.displayName
      }
    }
  }
}
