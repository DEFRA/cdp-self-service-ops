import { fetcher } from '../../../helpers/fetcher.js'
import { getLatestImage } from '../../../helpers/portal-backend/get-latest-image.js'
import { runTestSuite } from './run-test-suite.js'
import { getLatestAppConfigCommitSha } from '../../../helpers/portal-backend/get-latest-app-config-commit-sha.js'
import { randomUUID } from 'node:crypto'

const mockInfoLogger = vi.fn()
const mockErrorLogger = vi.fn()
const mockDebugLogger = vi.fn()
const mockLogger = {
  info: mockInfoLogger,
  error: mockErrorLogger,
  debug: mockDebugLogger
}
const latestImageVersion = '1.0.0'
const mockUUID = 'b7a0d95e-5224-488f-b8bb-b1705436f413'
const mockSha = 'mock-sha'
const mockSNSClientSend = vi.fn()
const mockSNSClient = {
  send: mockSNSClientSend
}

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    randomUUID: () => mockUUID
  }
})

vi.mock('@aws-sdk/client-sns', () => ({
  PublishCommand: vi.fn()
}))

vi.mock('../../../helpers/fetcher.js')
vi.mock('../../../helpers/portal-backend/get-latest-app-config-commit-sha.js')
vi.mock('../../../helpers/portal-backend/get-latest-image.js')
vi.mock('../../../helpers/logging/logger.js', () => ({
  createLogger: () => mockLogger
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
      user: { id: randomUUID(), displayName: 'My Name' },
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
      user: { id: randomUUID(), displayName: 'My Name' },
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
      user: { id: randomUUID(), displayName: 'My Name' },
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

    const result = runTestSuite({
      imageName: 'some-service',
      environment: 'test',
      user: { id: randomUUID(), displayName: 'My Name' },
      cpu: '4096',
      memory: '8192',
      snsClient: mockSNSClient,
      logger: mockLogger
    })

    await expect(result).rejects.toMatch('Failure sending SNS message')
  })
})
