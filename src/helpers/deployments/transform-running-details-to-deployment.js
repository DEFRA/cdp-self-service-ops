import { generateDeployment } from './generate-deployment.js'

/**
 * @param {{cdpDeploymentId: string, status: string, service: string, version:string, configVersion: string, environment: string, memory: number, cpu: number, instanceCount: number, user: object}} runningDetails
 * @param {string} zone
 * @returns {{deploymentId: string, deploy: boolean, service: {name: string, version: string, configuration: {commitSha: string}}, cluster: {environment: string, zone: string}, resources: {memory: number, cpu: number, instanceCount: number}, metadata: {user: object}}}
 */
export function transformRunningDetailsToDeployment(
  {
    cdpDeploymentId,
    status,
    service,
    version,
    configVersion,
    environment,
    memory,
    cpu,
    instanceCount,
    user
  },
  zone
) {
  return generateDeployment({
    payload: {
      imageName: service,
      version,
      environment,
      instanceCount,
      cpu,
      memory
    },
    zone,
    deploymentId: cdpDeploymentId,
    commitSha: configVersion,
    deploy: status === 'running',
    user
  })
}
