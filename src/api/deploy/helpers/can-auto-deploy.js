const scheduledDeployUserId = '00000000-0000-0000-0000-00000000001'
const canaryServiceName = 'cdp-canary-deployment-backend'

function canAutoDeploy({ imageName, environment, user }) {
  if (environment !== 'prod') {
    return true
  }

  return user?.id === scheduledDeployUserId && imageName === canaryServiceName
}

export { canAutoDeploy, scheduledDeployUserId, canaryServiceName }
