const scheduledDeployUserId = '00000000-0000-0000-0000-00000000001'
const canaryServiceName = 'cdp-canary-deployment-backend'

function canAutoDeployToProd({ imageName, environment, user }) {
  if (environment !== 'prod') {
    return true
  }

  return user?.id === scheduledDeployUserId && imageName === canaryServiceName
}

export { canAutoDeployToProd, scheduledDeployUserId, canaryServiceName }
