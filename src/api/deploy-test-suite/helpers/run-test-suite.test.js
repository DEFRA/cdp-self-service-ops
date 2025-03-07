import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'
import { getLatestAppConfigCommitSha } from '~/src/helpers/portal-backend/get-latest-app-config-commit-sha.js'
import { runTestSuite } from '~/src/api/deploy-test-suite/helpers/run-test-suite.js'
import pino from 'pino'
import { config } from '~/src/config/index.js'

jest.mock(
  '~/src/helpers/portal-backend/get-latest-app-config-commit-sha.js',
  () => ({
    getLatestAppConfigCommitSha: jest.fn()
  })
)

jest.mock('~/src/helpers/sns/send-sns-message.js', () => ({
  sendSnsMessage: jest.fn().mockResolvedValue({})
}))

jest.mock('~/src/api/deploy-test-suite/helpers/record-test-run.js', () => ({
  recordTestRun: jest.fn().mockResolvedValue({})
}))

describe('#runTestSuite', () => {
  test('Should send message to sns', async () => {
    const snsClient = jest.fn()

    const commit =
      'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
    getLatestAppConfigCommitSha.mockResolvedValue(commit)

    const res = await runTestSuite(
      'some-service',
      'test',
      {
        id: 'some-id',
        displayName: 'My Name'
      },
      snsClient,
      pino()
    )

    const basePath = `arn:aws:s3:::cdp-test-service-configs/${commit}`
    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      config.get('snsRunTestTopicArn'),
      expect.objectContaining({
        environment: 'test',
        zone: 'public',
        name: 'some-service',
        image: 'some-service',
        image_version: 'latest',
        port: 80,
        task_cpu: 4096,
        task_memory: 8192,
        webdriver_sidecar: {
          browser: 'chrome',
          version: 'latest'
        },
        deployed_by: {
          userId: 'some-id',
          displayName: 'My Name'
        },
        environment_variables: expect.objectContaining({
          BASE_URL: `https://test.cdp-int.defra.cloud/`,
          ENVIRONMENT: 'test'
        }),
        environment_files: [
          {
            value: `${basePath}/global/global_fixed.env`,
            type: 's3'
          },
          {
            value: `${basePath}/services/some-service/test/some-service.env`,
            type: 's3'
          },
          {
            value: `${basePath}/services/some-service/defaults.env`,
            type: 's3'
          },
          {
            value: `${basePath}/environments/test/defaults.env`,
            type: 's3'
          }
        ]
      }),
      expect.anything()
    )

    expect(res).not.toBeNull()
  })
})
