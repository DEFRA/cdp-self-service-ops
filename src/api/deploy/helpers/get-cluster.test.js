import { getCluster } from '~/src/api/deploy/helpers/get-cluster'

const publicClusterServices = [
  { container_image: 'cdp-basic-node-frontend' },
  { container_image: 'cdp-portal-frontend' }
]

const protectedClusterServices = [
  { container_image: 'cdp-teams-and-repositories' },
  { container_image: 'cdp-self-service-ops' }
]

describe('#getCluster', () => {
  test('Should identify public cluster image', () => {
    expect(
      getCluster(
        'infra-dev',
        'cdp-portal-frontend',
        publicClusterServices,
        protectedClusterServices
      )
    ).toEqual({
      clusterName: 'public',
      clusterServices: publicClusterServices
    })
  })

  test('Should identify backend cluster image', () => {
    expect(
      getCluster(
        'management',
        'cdp-self-service-ops',
        publicClusterServices,
        protectedClusterServices
      )
    ).toEqual({
      clusterName: 'protected',
      clusterServices: protectedClusterServices
    })
  })

  test('Should return "Unable to identify" cluster from image error', () => {
    expect.assertions(2)

    try {
      getCluster(
        'development',
        'non-existent-service',
        publicClusterServices,
        protectedClusterServices
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'non-existent-service does not belong to a cluster in the development environment'
      )
    }
  })
})
