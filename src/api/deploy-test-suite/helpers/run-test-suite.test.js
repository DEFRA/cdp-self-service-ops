import { fetcher } from '~/src/helpers/fetcher.js'
import { getLatestImage } from '~/src/helpers/portal-backend/get-latest-image.js'
import { runTestSuite } from '~/src/api/deploy-test-suite/helpers/run-test-suite.js'
import { getLatestAppConfigCommitSha } from '~/src/helpers/portal-backend/get-latest-app-config-commit-sha.js'

const mockInfoLogger = jest.fn()
const mockErrorLogger = jest.fn()
const mockDebugLogger = jest.fn()
const mockLogger = {
  info: mockInfoLogger,
  error: mockErrorLogger,
  debug: mockDebugLogger
}
const latestImageVersion = '1.0.0'
const mockUUID = 'b7a0d95e-5224-488f-b8bb-b1705436f413'
const mockSha = 'mock-sha'
const mockSNSClientSend = jest.fn()
const mockSNSClient = {
  send: mockSNSClientSend
}

jest.mock('node:crypto', () => ({
  randomUUID: () => mockUUID
}))
jest.mock('@aws-sdk/client-sns', () => ({
  PublishCommand: jest.fn()
}))
jest.mock('~/src/helpers/fetcher.js')
jest.mock('~/src/helpers/portal-backend/get-latest-app-config-commit-sha.js')
jest.mock('~/src/helpers/portal-backend/get-latest-image.js')
jest.mock('~/src/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: (value) => mockInfoLogger(value),
    error: (value) => mockErrorLogger(value)
  })
}))

describe('#runTestSuite', () => {
  beforeEach(() => {
    getLatestAppConfigCommitSha.mockResolvedValue(mockSha)
    getLatestImage.mockResolvedValue({ tag: latestImageVersion })
    fetcher.mockResolvedValue({})
    mockSNSClientSend.mockResolvedValue({})
  })

  test('Should return runId when all operations succeed', async () => {
    const runId = await runTestSuite({
      imageName: 'some-service',
      environment: 'test',
      user: { id: 'some-id', displayName: 'My Name' },
      cpu: '4096',
      memory: '8192',
      snsClient: mockSNSClient,
      logger: mockLogger
    })

    expect(runId).toBe(mockUUID)
  })

  test('Should return "null" when getLatestAppConfigCommitSha fails', async () => {
    getLatestAppConfigCommitSha.mockResolvedValue(null)

    const runId = await runTestSuite({
      imageName: 'some-service',
      environment: 'test',
      user: { id: 'some-id', displayName: 'My Name' },
      cpu: '4096',
      memory: '8192',
      snsClient: mockSNSClient,
      logger: mockLogger
    })

    expect(runId).toBeNull()
  })

  test('Should log error when getLatestAppConfigCommitSha fails', async () => {
    getLatestAppConfigCommitSha.mockResolvedValue(null)

    await runTestSuite({
      imageName: 'some-service',
      environment: 'test',
      user: { id: 'some-id', displayName: 'My Name' },
      cpu: '4096',
      memory: '8192',
      snsClient: mockSNSClient,
      logger: mockLogger
    })

    expect(mockErrorLogger).toHaveBeenCalledWith(
      'Error encountered whilst attempting to get latest cdp-app-config sha'
    )
  })

  test('Should return expected message when sendSnsMessage fails', async () => {
    mockSNSClientSend.mockRejectedValue('Failure sending SNS message')

    await expect(
      runTestSuite({
        imageName: 'some-service',
        environment: 'test',
        user: { id: 'some-id', displayName: 'My Name' },
        cpu: '4096',
        memory: '8192',
        snsClient: mockSNSClient,
        logger: mockLogger
      })
    ).rejects.toMatch('Failure sending SNS message')
  })
})
