export const featureToggles = {
  archiveGitHubWorkflow: 'archiveGitHubWorkflow',
  dockerImages: {
    deleteEcr: 'dockerImages.deleteEcr',
    deleteDockerHub: 'dockerImages.deleteDockerHub'
  },
  removeServiceWorkflows: 'removeServiceWorkflows',
  undeploy: {
    deleteDeploymentFiles: 'undeploy.deleteDeploymentFiles',
    deleteEcsService: 'undeploy.deleteEcsService',
    register: 'undeploy.register',
    scaleEcsToZero: 'undeploy.scaleEcsToZero'
  }
}
