import { describe, expect, test, vi } from 'vitest'

vi.mock('~/src/helpers/oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

const mockCommitFile = vi.fn()
vi.mock('~/src/helpers/github/commit-github-file.js', () => ({
  commitFile: mockCommitFile
}))

const logger = {
  info: vi.fn()
}
const deployment = {
  service: {
    name: 'some-name',
    version: 'some-version'
  },
  cluster: {
    environment: 'some-env',
    zone: 'some-zone'
  },
  metadata: {
    user: {
      userId: 'some-user-id',
      displayName: 'some-name'
    }
  }
}

describe('#commitDeploymentFile', () => {
  test('Should commit with filePath', async () => {
    const { commitDeploymentFile } = await import(
      '~/src/helpers/deployments/commit-deployment-file.js'
    )

    await commitDeploymentFile(deployment, logger)

    expect(mockCommitFile).toHaveBeenCalledWith(
      'DEFRA',
      'cdp-app-deployments',
      'main',
      'some-name some-version to some-env\nInitiated by some-name',
      'environments/some-env/some-zone/some-name.json',
      deployment,
      logger
    )
  })
})
