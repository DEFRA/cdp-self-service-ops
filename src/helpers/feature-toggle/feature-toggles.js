export const featureToggles = {
  decommissionService: 'decommissionService',
  archiveGitHubWorkflow: 'archiveGitHubWorkflow',
  dockerImages: {
    deleteEcr: 'dockerImages.deleteEcr',
    deleteDockerHub: 'dockerImages.deleteDockerHub'
  },
  removeServiceWorkflows: 'removeServiceWorkflows',
  scaleEcsToZero: 'scaleEcsToZero',
  undeploy: {
    deleteDeploymentFiles: 'undeploy.deleteDeploymentFiles',
    deleteEcsService: 'undeploy.deleteEcsService'
  }
}
