import {
  generateGitHubDeployment,
  generateLambdaDeployment
} from './generate-deployment.js'
import { ValidationError } from 'joi'
import { randomUUID } from 'node:crypto'

describe('#generateGitHubDeployment', () => {
  test('Should return valid json', () => {
    const userId = randomUUID()
    const deployment = generateGitHubDeployment({
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
      generateGitHubDeployment({
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

describe('#generateLambdaDeployment', () => {
  test('Should return valid json', () => {
    const userId = 'user-1234'
    const deployment = generateLambdaDeployment({
      payload: {
        imageName: 'image',
        version: '0.0.1',
        environment: 'infra-dev',
        instanceCount: 1,
        cpu: 512,
        memory: 4096
      },
      zone: 'protected',
      deploymentId: '84fbba63-d465-45e6-bca4-ce0cee084c95',
      commitSha: 'sha123',
      deploy: true,
      user: { id: userId, displayName: 'My Name' },
      serviceCode: 'FOO',
      deploymentEnvironment: 'local'
    })

    expect(deployment).toMatchObject({
      name: 'image',
      container_port: 8085,
      container_image: 'image',
      container_version: '0.0.1',
      desired_count: 1,
      task_cpu: 512,
      task_memory: 4096,
      env_files: [
        {
          value: `arn:aws:s3:::cdp-infra-dev-service-configs/sha123/global/global_protected_fixed.env`,
          type: 's3'
        },
        {
          value: `arn:aws:s3:::cdp-infra-dev-service-configs/sha123/services/image/infra-dev/image.env`,
          type: 's3'
        },
        {
          value: `arn:aws:s3:::cdp-infra-dev-service-configs/sha123/services/image/defaults.env`,
          type: 's3'
        },
        {
          value: `arn:aws:s3:::cdp-infra-dev-service-configs/sha123/environments/infra-dev/defaults.env`,
          type: 's3'
        }
      ],
      deployed_by: {
        deployment_id: '84fbba63-d465-45e6-bca4-ce0cee084c95',
        user_id: userId,
        display_name: 'My Name'
      },
      zone: 'protected',
      environment: 'infra-dev',
      service_code: 'FOO',
      use_new_iam_role: 'false'
    })
  })
})
