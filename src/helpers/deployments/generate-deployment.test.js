import { generateDeployment } from '~/src/helpers/deployments/generate-deployment.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'
import { ValidationError } from 'joi'

describe('#generateDeployment', () => {
  test('Should return valid json', () => {
    const deployment = generateDeployment({
      payload: {
        imageName: 'image',
        version: '0.0.1',
        environment: 'infra-dev',
        instanceCount: 1,
        cpu: 512,
        memory: 4096
      },
      zone: 'Protected',
      deploymentId: 'abc-123',
      commitSha: 'sha123',
      deploy: true,
      user: { id: 'some-id', displayName: 'My Name' },
      deploymentEnvironment: 'infra-dev'
    })

    expect(deployment.metadata.user.userId).toBe('some-id')
    expect(deployment.metadata.user.displayName).toBe('My Name')
  })

  test('Should fail with invalid user return valid json', () => {
    const unawaitedUser = getScopedUser('some-id', {
      credentials: {
        id: 'some-id',
        displayName: 'My Name',
        scope: ['admin'],
        scopeFlags: {}
      }
    })
    expect(() =>
      generateDeployment({
        payload: {
          imageName: 'image',
          version: '0.0.1',
          environment: 'infra-dev',
          instanceCount: 1,
          cpu: 2048,
          memory: 8192
        },
        zone: 'Protected',
        deploymentId: 'abc-123',
        commitSha: 'sha123',
        deploy: true,
        user: unawaitedUser,
        deploymentEnvironment: 'infra-dev'
      })
    ).toThrow(ValidationError)
  })
})
