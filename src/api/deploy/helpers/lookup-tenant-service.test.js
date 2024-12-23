import { getContent } from '~/src/helpers/github/get-content.js'
import { config } from '~/src/config/index.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

jest.mock('~/src/helpers/github/get-content', () => ({
  getContent: jest.fn()
}))
const mockGetContent = getContent
const logger = createLogger()

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

    const result = await lookupTenantService('someService', 'dev', logger)

    expect(mockGetContent).toHaveBeenCalledWith(
      org,
      repo,
      'environments/dev/tenants/someService.json',
      'main'
    )
    expect(result).toEqual(tenant)
  })

  test('should return nothing when the service doesnt exist', async () => {
    getContent.mockResolvedValue(null)

    const result = await lookupTenantService('someService', 'dev', logger)

    expect(mockGetContent).toHaveBeenCalledTimes(1)
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

    await lookupTenantService('someService', 'dev', logger, '87428fc5')

    expect(mockGetContent).toHaveBeenNthCalledWith(
      1,
      org,
      repo,
      'environments/dev/tenants/someService.json',
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

    const result = await lookupTenantService('someService', 'dev', logger)

    expect(mockGetContent).toHaveBeenCalledWith(
      org,
      repo,
      'environments/dev/tenants/someService.json',
      'main'
    )
    expect(result).toEqual(tenant)
  })
})
