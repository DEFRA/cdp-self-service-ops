import { getContent } from '~/src/helpers/github/get-content'
import { config } from '~/src/config/config'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service'

jest.mock('~/src/helpers/github/get-content', () => ({
  getContent: jest.fn()
}))
const mockGetContent = getContent

describe('lookupTenantService', () => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should get the tenant service from the single file version when present', async () => {
    const tenant = {
      zone: 'public',
      mongo: false,
      redis: true,
      service_code: 'ABC'
    }

    getContent.mockResolvedValue(JSON.stringify(tenant))

    const result = await lookupTenantService('someService', 'dev')

    expect(mockGetContent).toHaveBeenCalledWith(
      org,
      repo,
      'environments/dev/tenants/someService.json',
      'main'
    )
    expect(result).toEqual(tenant)
  })

  test('should fallback to legacy tenant json when not found', async () => {
    const tenants = [
      {
        someService: {
          zone: 'public',
          mongo: false,
          redis: true,
          service_code: 'ABC'
        }
      }
    ]

    getContent
      .mockReturnValueOnce(null)
      .mockResolvedValue(JSON.stringify(tenants))

    const result = await lookupTenantService('someService', 'dev')

    expect(mockGetContent).toHaveBeenNthCalledWith(
      1,
      org,
      repo,
      'environments/dev/tenants/someService.json',
      'main'
    )

    expect(mockGetContent).toHaveBeenNthCalledWith(
      2,
      org,
      repo,
      'environments/dev/resources/tenant_services.json',
      'main'
    )

    expect(result).toEqual({
      zone: 'public',
      mongo: false,
      redis: true,
      service_code: 'ABC'
    })
  })

  test('should fallback to legacy tenant json when service_code is missing', async () => {
    const missingServiceCode = {
      zone: 'public',
      mongo: false,
      redis: true
    }
    const tenants = [
      {
        someService: {
          zone: 'public',
          mongo: false,
          redis: true,
          service_code: 'ABC'
        }
      }
    ]

    getContent
      .mockReturnValueOnce(missingServiceCode)
      .mockResolvedValue(JSON.stringify(tenants))

    const result = await lookupTenantService('someService', 'dev')

    expect(mockGetContent).toHaveBeenNthCalledWith(
      1,
      org,
      repo,
      'environments/dev/tenants/someService.json',
      'main'
    )

    expect(mockGetContent).toHaveBeenNthCalledWith(
      2,
      org,
      repo,
      'environments/dev/resources/tenant_services.json',
      'main'
    )

    expect(result).toEqual({
      zone: 'public',
      mongo: false,
      redis: true,
      service_code: 'ABC'
    })
  })

  test('should return nothing when the service doesnt exist', async () => {
    getContent.mockResolvedValue(null)

    const result = await lookupTenantService('someService', 'dev')

    expect(mockGetContent).toHaveBeenCalledTimes(2)
    expect(result).toBeUndefined()
  })

  test('should use a different ref when specified', async () => {
    const tenants = [
      {
        someService: {
          zone: 'public',
          mongo: false,
          redis: true,
          service_code: 'ABC'
        }
      }
    ]

    getContent
      .mockReturnValueOnce(null)
      .mockResolvedValue(JSON.stringify(tenants))

    await lookupTenantService('someService', 'dev', '87428fc5')

    expect(mockGetContent).toHaveBeenNthCalledWith(
      1,
      org,
      repo,
      'environments/dev/tenants/someService.json',
      '87428fc5'
    )

    expect(mockGetContent).toHaveBeenNthCalledWith(
      2,
      org,
      repo,
      'environments/dev/resources/tenant_services.json',
      '87428fc5'
    )
  })

  test('should get the tenant service from the single file version when present even if it has extra fields', async () => {
    const tenant = {
      zone: 'public',
      mongo: false,
      redis: true,
      service_code: 'ABC',
      postgres: true
    }

    getContent.mockResolvedValue(JSON.stringify(tenant))

    const result = await lookupTenantService('someService', 'dev')

    expect(mockGetContent).toHaveBeenCalledWith(
      org,
      repo,
      'environments/dev/tenants/someService.json',
      'main'
    )
    expect(result).toEqual(tenant)
  })
})
