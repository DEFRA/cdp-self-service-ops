import { addRepoToPermissions } from './add-repo-to-permissions'
import { createLogger } from '~/src/helpers/logger'
import githubOidcRepositoriesFixture from '~/src/__fixtures__/github_oidc_repositories'

jest.mock('~/src/helpers/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  })
}))

describe('#addRepoToPermissions', () => {
  const logger = createLogger()
  const permissionsFixture = JSON.stringify(githubOidcRepositoriesFixture)

  test('Should insert a new repo in the correct position', () => {
    const expectedJson = JSON.stringify(
      [
        ...githubOidcRepositoriesFixture,
        'defra-cdp-sandpit/cdp-mock-permissions'
      ],
      null,
      2
    )

    expect(
      addRepoToPermissions({
        permissions: permissionsFixture,
        filePath: 'snd/github_oidc_repositories.json',
        fileRepository: 'tf-svc-infra',
        repositoryName: 'cdp-mock-permissions',
        org: 'defra-cdp-sandpit'
      })
    ).toEqual(expectedJson)
  })

  test('Should NOT insert into the list, if a repos permissions already exist', () => {
    expect(
      addRepoToPermissions({
        permissions: permissionsFixture,
        filePath: 'snd/github_oidc_repositories.json',
        fileRepository: 'tf-svc-infra',
        repositoryName: 'farmer-plant-frontend',
        org: 'defra-cdp-sandpit'
      })
    ).toEqual(JSON.stringify(JSON.parse(permissionsFixture), null, 2))
  })

  test('Should throw "Pre Addition" error', () => {
    const permissionsWithError = JSON.stringify([
      ...githubOidcRepositoriesFixture,
      'invalid-permissions-n$me'
    ])

    expect.assertions(4)

    try {
      addRepoToPermissions({
        permissions: permissionsWithError,
        filePath: 'snd/github_oidc_repositories.json',
        fileRepository: 'tf-svc-infra',
        repositoryName: 'farmer-plant-frontend',
        org: 'defra-cdp-sandpit'
      })
    } catch (error) {
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        "Permissions file 'snd/github_oidc_repositories.json' from 'tf-svc-infra' failed schema validation"
      )
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'Permissions file failed schema validation'
      )
    }
  })

  test('Should throw "Post Addition" error', () => {
    try {
      addRepoToPermissions({
        permissions: permissionsFixture,
        filePath: 'snd/github_oidc_repositories.json',
        fileRepository: 'tf-svc-infra',
        repositoryName: 'bad-repo/name/farmer-plant-frontend',
        org: 'defra-cdp-sandpit'
      })
    } catch (error) {
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        "Permissions addition of 'defra-cdp-sandpit/bad-repo/name/farmer-plant-frontend' to 'snd/github_oidc_repositories.json' from 'tf-svc-infra failed schema validation"
      )
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'Post permissions name addition, file failed schema validation'
      )
    }
  })
})
