import { addRepoName } from '~/src/api/createV2/helpers/add-repo-name'
import { createLogger } from '~/src/helpers/logging/logger'
import tenantServicesFixture from '~/src/__fixtures__/tenant_services'

jest.mock('~/src/helpers/logging/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  })
}))

describe('#addRepoName', () => {
  const logger = createLogger()

  test('Should add new repository', () => {
    const repositoriesJson = JSON.stringify(tenantServicesFixture)
    const expectedJson = JSON.stringify(
      [
        {
          ...tenantServicesFixture[0],
          ...{
            'new-repository-name': { zone: 'public', mongo: false, redis: true }
          }
        }
      ],
      null,
      2
    )

    expect(
      addRepoName({
        repositories: repositoriesJson,
        fileRepository: 'mock-repo',
        filePath: 'mock-file-path',
        repositoryName: 'new-repository-name',
        zone: 'public'
      })
    ).toEqual(expectedJson)
    expect(logger.error).not.toHaveBeenCalled()
  })

  test('Should throw "Pre Addition" error', () => {
    const repositoriesWithError = JSON.stringify([
      { ...tenantServicesFixture, ...{ '': [] } }
    ])

    expect.assertions(4)

    try {
      addRepoName({
        repositories: repositoriesWithError,
        fileRepository: 'mock-repo',
        filePath: 'mock-file-path',
        repositoryName: 'new-repository-name'
      })
    } catch (error) {
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        "Tenant Services file 'mock-file-path' from 'mock-repo failed schema validation"
      )
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', 'File failed schema validation')
    }
  })

  test('Should throw "Post Addition" error', () => {
    const repositoriesJson = JSON.stringify(tenantServicesFixture)

    expect.assertions(4)

    try {
      addRepoName({
        repositories: repositoriesJson,
        fileRepository: 'mock-repo',
        filePath: 'mock-file-path',
        repositoryName: 'new-repo-name',
        zone: 'wrong-cluster'
      })
    } catch (error) {
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        "Addition of 'new-repo-name' to 'mock-file-path' from 'mock-repo failed schema validation"
      )
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'Post repository name addition, file failed schema validation'
      )
    }
  })
})
