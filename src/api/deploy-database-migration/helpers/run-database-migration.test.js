import { fetcher } from '~/src/helpers/fetcher.js'
import { runDatabaseMigration } from '~/src/api/deploy-database-migration/helpers/run-database-migration.js'
import { vi } from 'vitest'
import { validate as validateUUID } from 'uuid'

const mockInfoLogger = vi.fn()
const mockErrorLogger = vi.fn()
const mockDebugLogger = vi.fn()
const mockLogger = {
  info: mockInfoLogger,
  error: mockErrorLogger,
  debug: mockDebugLogger
}
const userId = '4bbc4178-28ee-4a2c-9a1b-2c5f174d228b'
const version = '1.0.0'
const mockSNSClientSend = vi.fn()
const mockSNSClient = {
  send: mockSNSClientSend
}

vi.mock('@aws-sdk/client-sns', () => ({
  PublishCommand: vi.fn()
}))
vi.mock('~/src/helpers/fetcher.js')
vi.mock('~/src/helpers/logging/logger.js', () => ({
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
      user: { id: userId, displayName: 'My Name' },
      snsClient: mockSNSClient,
      logger: mockLogger
    })

    expect(validateUUID(migrationId)).toBe(true)
  })

  test('Should return expected message when sendSnsMessage fails', async () => {
    mockSNSClientSend.mockRejectedValue('Failure sending SNS message')

    await expect(
      runDatabaseMigration({
        service: 'some-service',
        environment: 'test',
        version,
        user: { id: userId, displayName: 'My Name' },
        snsClient: mockSNSClient,
        logger: mockLogger
      })
    ).rejects.toMatch('Failure sending SNS message')
  })
})
