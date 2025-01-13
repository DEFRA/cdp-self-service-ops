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
const owner = 'some-org'
const repo = 'some-repo'

describe('#commitDeploymentFile', () => {
  test('Should commit with filePath', async () => {
    await commitDeploymentFile({
      deployment,
      owner,
      repo,
      logger
    })

    expect(commitFile).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'some-org',
        repo: 'some-repo',
        filePath: 'environments/some-env/some-zone/some-name.json'
      })
    )
  })

  test('Should use deployment env', async () => {
    await commitDeploymentFile({
      deployment: {
        ...deployment,
        metadata: {
          ...deployment.metadata,
          deploymentEnvironment: 'some-deployment-env'
        }
      },
      owner,
      repo,
      logger
    })

    expect(commitFile).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          metadata: expect.objectContaining({
            deploymentEnvironment: 'some-deployment-env'
          })
        })
      })
    )
  })
})
