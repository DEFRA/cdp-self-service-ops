export const featureToggles = {
  archiveGitHubWorkflow: 'archiveGitHubWorkflow',
  dockerImages: {
    deleteEcr: 'dockerImages.deleteEcr',
    deleteDockerHub: 'dockerImages.deleteDockerHub'
  },
  removeServiceWorkflows: 'removeServiceWorkflows',
  undeploy: {
    deleteDeploymentFiles: 'undeploy.deleteDeploymentFiles',
    deleteEcsTask: 'undeploy.deleteEcsTask',
    register: 'undeploy.register',
    scaleEcsToZero: 'undeploy.scaleEcsToZero'
  }
}
