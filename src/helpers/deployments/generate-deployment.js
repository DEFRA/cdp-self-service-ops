import { config } from '~/src/config/index.js'

const currentEnvironment = config.get('environment')

/**
 * @param {{payload: {imageName: string, version:string, environment: string, instanceCount: number, cpu: number, memory: number}, zone: string, deploymentId: string, commitSha: string, serviceCode: ?string, deploy: ?boolean, user: {id: string, displayName: string}, deploymentEnvironment: ?string}} options
 */
export function generateDeployment({
  payload: { imageName, version, environment, instanceCount, cpu, memory },
  zone,
  deploymentId,
  commitSha,
  serviceCode,
  deploy,
  user,
  deploymentEnvironment = currentEnvironment
}) {
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
        userId: user.id,
        displayName: user.displayName
      },
      deploymentEnvironment
    }
  }
}
