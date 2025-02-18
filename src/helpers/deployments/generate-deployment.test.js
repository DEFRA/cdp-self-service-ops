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
      zone: 'protected',
      deploymentId: crypto.randomUUID(),
      commitSha: 'sha123',
      deploy: true,
      user: { id: 'some-id', displayName: 'My Name' },
      deploymentEnvironment: 'local'
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
        zone: 'public',
        deploymentId: crypto.randomUUID(),
        commitSha: 'sha123',
        deploy: true,
        user: unawaitedUser,
        deploymentEnvironment: 'local'
      })
    ).toThrow(ValidationError)
  })
})
