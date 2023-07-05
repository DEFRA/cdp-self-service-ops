import { octokit } from '~/src/helpers/oktokit'
import { addRepoToEcrRepoNames } from '~/src/api/create/helpers/add-repo-to-ecr-repo-names'
import ecrRepoNamesFixture from '~/src/__fixtures__/ecr_repo_names'

jest.mock('~/src/helpers/oktokit', () => ({
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn()
      }
    }
  }
}))

describe('#addRepoToEcrRepoNames', () => {
  test('Should return expected filePath and Json', async () => {
    octokit.rest.repos.getContent.mockImplementation(() => ({
      data: JSON.stringify(ecrRepoNamesFixture)
    }))

    const [filePath, repositoryNamesJson] = await addRepoToEcrRepoNames(
      'mock-service-frontend',
      'infra-dev'
    )

    expect(filePath).toEqual(
      'environments/infra-dev/resources/ecr_repo_names.json'
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
