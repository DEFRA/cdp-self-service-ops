import { generateDeployment } from './generate-deployment.js'
import { ValidationError } from 'joi'
import { randomUUID } from 'node:crypto'

describe('#generateDeployment', () => {
  test('Should return valid json', () => {
    const userId = randomUUID()
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
      deploymentId: randomUUID(),
      commitSha: 'sha123',
      deploy: true,
      user: { id: userId, displayName: 'My Name' },
      deploymentEnvironment: 'local'
    })

    expect(deployment.metadata.user.userId).toBe(userId)
    expect(deployment.metadata.user.displayName).toBe('My Name')
  })

  test('Should fail with invalid user return valid json', () => {
    const unawaitedUser = new Promise(() => ({}))
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
