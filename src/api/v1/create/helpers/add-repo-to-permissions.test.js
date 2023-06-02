import { addGithubPermission } from './add-repo-to-permissions'

const testData = `[
  "defra-cdp-sandpit/foo",
  "defra-cdp-sandpit/baz",
  "defra-cdp-sandpit/bar"
]`

const expectedData = `[
  "defra-cdp-sandpit/foo",
  "defra-cdp-sandpit/baz",
  "defra-cdp-sandpit/bar",
  "defra-cdp-sandpit/test"
]`

describe('add repo to permissions terraform', () => {
  test('it inserts a new repo in the correct possition', () => {
    expect(
      addGithubPermission({
        repositories: testData,
        filePath: '/test/file.json',
        fileRepository: 'filerepo',
        repositoryName: 'test',
        org: 'defra-cdp-sandpit'
      })
    ).toBe(expectedData)
  })

  test('it does NOT inserts a repo into the list if it already exists', () => {
    expect(
      addGithubPermission({
        repositories: testData,
        filePath: '/test/file.json',
        fileRepository: 'filerepo',
        repositoryName: 'baz',
        org: 'defra-cdp-sandpit'
      })
    ).toBe(testData)
  })
})
