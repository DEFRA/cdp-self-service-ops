import { octokit } from '~/src/helpers/oktokit'
import { addRepoToTenantServices } from '~/src/api/create-microservice/helpers/add-repo-to-tenant-services'
import tenantServicesFixture from '~/src/__fixtures__/tenant_services'

jest.mock('~/src/helpers/oktokit', () => ({
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn()
      }
    }
  }
}))

describe('#addRepoToTenantServices', () => {
  test('Should return expected filePath and Json', async () => {
    octokit.rest.repos.getContent.mockImplementation(() => ({
      data: JSON.stringify(tenantServicesFixture)
    }))

    const [filePath, repositoryNamesJson] = await addRepoToTenantServices(
      'mock-service-frontend',
      'infra-dev',
      'public'
    )

    expect(filePath).toEqual(
      'environments/infra-dev/resources/tenant_services.json'
    )
    expect(repositoryNamesJson).toEqual(
      JSON.stringify(
        [
          {
            'cdp-portal-frontend': {
              zone: 'public',
              mongo: false,
              redis: true,
              queues: ['ecr-queue'],
              ecr: ['*'],
              s3: []
            },
            'cdp-portal-backend': {
              zone: 'protected',
              mongo: true
            },
            'mock-service-frontend': {
              zone: 'public',
              mongo: false,
              redis: true
            }
          }
        ],
        null,
        2
      )
    )
  })
})
