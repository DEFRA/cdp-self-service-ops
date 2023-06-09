import Boom from '@hapi/boom'

import { getClusterServiceNames } from '~/src/api/v1/deploy/helpers/get-cluster-service-names'

async function getClusterName({ environment, imageName }) {
  const frontendClusterServiceNames = await getClusterServiceNames(
    environment,
    'frontend'
  )
  const backendClusterServiceNames = await getClusterServiceNames(
    environment,
    'backend'
  )

  if (frontendClusterServiceNames.includes(imageName)) {
    return 'frontend'
  }

  if (backendClusterServiceNames.includes(imageName)) {
    return 'backend'
  }

  return Boom.boomify(
    new Error(`Unable to determine which cluster ${imageName} belongs to.`),
    { statusCode: 500 }
  )
}

export { getClusterName }
