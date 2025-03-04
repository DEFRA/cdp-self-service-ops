import { commitFile } from '~/src/helpers/github/commit-github-file.js'
import { commitDeploymentFile } from '~/src/helpers/deployments/commit-deployment-file.js'

jest.mock('~/src/helpers/github/commit-github-file.js')

const logger = {
  info: jest.fn()
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
    await commitDeploymentFile(deployment, logger)

    expect(commitFile).toHaveBeenCalledWith(
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
