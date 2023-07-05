import { addRepoName } from '~/src/api/create/helpers/add-repo-name'
import { createLogger } from '~/src/helpers/logger'
import ecrRepoNamesFixture from '~/src/__fixtures__/ecr_repo_names'

jest.mock('~/src/helpers/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  })
}))

describe('#addRepository', () => {
  const logger = createLogger()

  test('Should add new repository', () => {
    const repositoriesJson = JSON.stringify(ecrRepoNamesFixture)
    const expectedJson = JSON.stringify(
      [...ecrRepoNamesFixture, 'new-repository-name'],
      null,
      2
    )

    expect(
      addRepoName({
        repositories: repositoriesJson,
        fileRepository: 'mock-repo',
        filePath: 'mock-file-path',
        repositoryName: 'new-repository-name'
      })
    ).toEqual(expectedJson)
    expect(logger.error).not.toHaveBeenCalled()
  })

  test('Should throw "Pre Addition" error', () => {
    const repositoriesWithError = JSON.stringify([
      ...ecrRepoNamesFixture,
      'invalid-n$me'
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
        "ECR repos file 'mock-file-path' from 'mock-repo failed schema validation"
      )
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', 'File failed schema validation')
    }
  })

  test('Should throw "Post Addition" error', () => {
    const repositoriesJson = JSON.stringify(ecrRepoNamesFixture)

    expect.assertions(4)

    try {
      addRepoName({
        repositories: repositoriesJson,
        fileRepository: 'mock-repo',
        filePath: 'mock-file-path',
        repositoryName: 'new-repo&*tory-name'
      })
    } catch (error) {
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        "Addition of 'new-repo&*tory-name' to 'mock-file-path' from 'mock-repo failed schema validation"
      )
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'Post repository name addition, file failed schema validation'
      )
    }
  })
})
