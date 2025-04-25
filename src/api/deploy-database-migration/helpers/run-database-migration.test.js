import { fetcher } from '~/src/helpers/fetcher.js'
import { runDatabaseMigration } from '~/src/api/deploy-database-migration/helpers/run-database-migration.js'

const mockInfoLogger = jest.fn()
const mockErrorLogger = jest.fn()
const mockDebugLogger = jest.fn()
const mockLogger = {
  info: mockInfoLogger,
  error: mockErrorLogger,
  debug: mockDebugLogger
}
const version = '1.0.0'
const mockUUID = 'b7a0d95e-5224-488f-b8bb-b1705436f413'
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
jest.mock('~/src/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: (value) => mockInfoLogger(value),
    error: (value) => mockErrorLogger(value)
  })
}))

describe('#runDatabaseMigration', () => {
  beforeEach(() => {
    fetcher.mockResolvedValue({})
    mockSNSClientSend.mockResolvedValue({})
  })

  test('Should return migrationId when all operations succeed', async () => {
    const migrationId = await runDatabaseMigration({
      service: 'some-service',
      environment: 'test',
      version,
      user: { id: 'some-id', displayName: 'My Name' },
      snsClient: mockSNSClient,
      logger: mockLogger
    })

    expect(migrationId).toBe(mockUUID)
  })

  test('Should return expected message when sendSnsMessage fails', async () => {
    mockSNSClientSend.mockRejectedValue('Failure sending SNS message')

    await expect(
      runDatabaseMigration({
        service: 'some-service',
        environment: 'test',
        version,
        user: { id: 'some-id', displayName: 'My Name' },
        snsClient: mockSNSClient,
        logger: mockLogger
      })
    ).rejects.toMatch('Failure sending SNS message')
  })
})
