import { octokit } from '~/src/helpers/oktokit'
import { addRepoToTenantServices } from '~/src/api/create/helpers/add-repo-to-tenant-services'
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
      'infra-dev'
    )

    expect(filePath).toEqual(
      'environments/infra-dev/resources/tenant_services.json'
    )
    expect(repositoryNamesJson).toEqual(
      JSON.stringify(
        [
          'cdp-portal-frontend',
          'cdp-node-frontend-template',
          'mock-service-frontend'
        ],
        null,
        2
      )
    )
  })
})
