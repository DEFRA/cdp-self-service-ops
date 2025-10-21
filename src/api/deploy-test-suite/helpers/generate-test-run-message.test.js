import { randomUUID } from 'node:crypto'

import { config } from '../../../config/index.js'
import { generateTestRunMessage } from './generate-test-run-message.js'

const expectedMessageResult = (runId, userId) => {
  const arnPrefix =
    'arn:aws:s3:::cdp-infra-dev-service-configs/f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
  return {
    cluster_name: 'ecs-public',
    deployed_by: {
      displayName: 'My Name',
      userId
    },
    desired_count: 1,
    environment: 'infra-dev',
    environment_files: [
      { type: 's3', value: `${arnPrefix}/global/global_fixed.env` },
      {
        type: 's3',
        value: `${arnPrefix}/services/some-service/infra-dev/some-service.env`
      },
      { type: 's3', value: `${arnPrefix}/services/some-service/defaults.env` },
      { type: 's3', value: `${arnPrefix}/environments/infra-dev/defaults.env` }
    ],
    environment_variables: {
      BASE_URL: 'https://infra-dev.cdp-int.defra.cloud/',
      ENVIRONMENT: 'infra-dev',
      HTTP_PROXY: 'http://fake-proxy'
    },
    image: 'some-service',
    image_version: '123.44.111',
    name: 'some-service',
    port: 80,
    runId,
    task_cpu: '4096',
    task_memory: '8192',
    webdriver_sidecar: {
      browser: 'chrome',
      version: 'latest'
    },
    zone: 'public'
  }
}

describe('#generateTestRunMessage', () => {
  afterEach(() => {
    config.set('httpProxy', '')
  })

  test('Schema should pass validation without errors', () => {
    config.set('httpProxy', 'http://fake-proxy')
    const mockRunId = randomUUID()

    expect(() =>
      generateTestRunMessage({
        testSuite: 'some-service',
        environment: 'infra-dev',
        cpu: '4096',
        memory: '8192',
        user: { id: randomUUID(), displayName: 'My Name' },
        tag: '123.44.111',
        runId: mockRunId,
        configCommitSha:
          'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
      })
    ).not.toThrow()
  })

  test('Message should return as expected', () => {
    config.set('httpProxy', 'http://fake-proxy')

    const mockRunId = randomUUID()

    const userId = randomUUID()
    const message = generateTestRunMessage({
      testSuite: 'some-service',
      environment: 'infra-dev',
      cpu: '4096',
      memory: '8192',
      user: { id: userId, displayName: 'My Name' },
      tag: '123.44.111',
      runId: mockRunId,
      configCommitSha:
        'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
    })

    expect(message).toEqual(expectedMessageResult(mockRunId, userId))
  })

  test('Should throw error when required fields are missing', () => {
    expect(() =>
      generateTestRunMessage({
        testSuite: 'some-service',
        environment: 'infra-dev',
        user: { id: randomUUID(), displayName: 'My Name' },
        tag: '123.44.111',
        runId: randomUUID()
      })
    ).toThrow('"task_cpu" is required')
  })

  test('Should throw error when values are incorrect', () => {
    expect(() =>
      generateTestRunMessage({
        testSuite: 'some-service',
        environment: 'infra-dev',
        cpu: '256',
        memory: '8192',
        user: { id: randomUUID(), displayName: 'My Name' },
        tag: '123.44.111',
        runId: randomUUID()
      })
    ).toThrow('"task_cpu" must be one of [512, 1024, 2048, 4096, 8192]')
  })

  test('Should generate expected environment variables', () => {
    config.set('httpProxy', 'http://fake-proxy')

    const message = generateTestRunMessage({
      testSuite: 'some-service',
      environment: 'infra-dev',
      cpu: '4096',
      memory: '8192',
      user: { id: randomUUID(), displayName: 'My Name' },
      tag: '123.44.111',
      runId: randomUUID(),
      configCommitSha:
        'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
    })

    expect(message.environment_variables.BASE_URL).toBe(
      'https://infra-dev.cdp-int.defra.cloud/'
    )
    expect(message.environment_variables.ENVIRONMENT).toBe('infra-dev')
    expect(message.environment_variables.HTTP_PROXY).toBe('http://fake-proxy')
  })

  test('Should handle missing configCommitSha', () => {
    config.set('httpProxy', 'http://fake-proxy')

    const message = generateTestRunMessage({
      testSuite: 'some-service',
      environment: 'infra-dev',
      cpu: '4096',
      memory: '8192',
      user: { id: randomUUID(), displayName: 'My Name' },
      tag: '123.44.111',
      runId: randomUUID()
    })

    expect(message.environment_files.at(0).value).toBe(
      'arn:aws:s3:::cdp-infra-dev-service-configs/global/global_fixed.env'
    )
  })
})
