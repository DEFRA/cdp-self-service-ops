import { getClusterName } from '~/src/api/v1/deploy/helpers/get-cluster-name'
import { getClusterServiceNames } from '~/src/api/v1/deploy/helpers/get-cluster-service-names'

jest.mock('../helpers/get-cluster-service-names', () => ({
  getClusterServiceNames: jest.fn()
}))

const mockFrontendClusterServiceNames = [
  'cdp-basic-node-frontend',
  'cdp-portal-frontend'
]

const mockBackendClusterServiceNames = [
  'cdp-teams-and-repositories',
  'cdp-self-service-ops'
]

describe('#getClusterName', () => {
  beforeEach(() => {
    getClusterServiceNames
      .mockReturnValueOnce(mockFrontendClusterServiceNames)
      .mockReturnValueOnce(mockBackendClusterServiceNames)
  })

  test('Should identify frontend cluster image', async () => {
    expect(
      await getClusterName({
        environment: 'sandbox',
        imageName: 'cdp-portal-frontend'
      })
    ).toEqual('frontend')
  })

  test('Should identify backend cluster image', async () => {
    expect(
      await getClusterName({
        environment: 'sandbox',
        imageName: 'cdp-self-service-ops'
      })
    ).toEqual('backend')
  })

  test('Should return "Unable to identify" cluster from image error', async () => {
    const result = await getClusterName({
      environment: 'sandbox',
      imageName: 'non-existent-service'
    })

    expect(result?.isBoom).toEqual(true)
    expect(result?.message).toEqual(
      'Unable to determine which cluster non-existent-service belongs to.'
    )
  })
})
