// TODO remove once snd has been aligned with other environments
function getSndClusterName(clusterName) {
  switch (true) {
    case clusterName === 'public':
      return 'frontend'
    case clusterName === 'protected':
      return 'backend'
    default:
      return null
  }
}

export { getSndClusterName }
