import { getClusterName } from '~/src/api/deploy/helpers/get-cluster-name'

const frontendClusterServices = [
  { container_image: 'cdp-basic-node-frontend' },
  { container_image: 'cdp-portal-frontend' }
]

const backendClusterServices = [
  { container_image: 'cdp-teams-and-repositories' },
  { container_image: 'cdp-self-service-ops' }
]

describe('#getClusterName', () => {
  test('Should identify frontend cluster image', () => {
    expect(
      getClusterName(
        'cdp-portal-frontend',
        frontendClusterServices,
        backendClusterServices
      )
    ).toEqual('frontend')
  })

  test('Should identify backend cluster image', () => {
    expect(
      getClusterName(
        'cdp-self-service-ops',
        frontendClusterServices,
        backendClusterServices
      )
    ).toEqual('backend')
  })

  test('Should return "Unable to identify" cluster from image error', () => {
    expect.assertions(2)

    try {
      getClusterName(
        'non-existent-service',
        frontendClusterServices,
        backendClusterServices
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'Unable to determine which cluster non-existent-service belongs to.'
      )
    }
  })
})
