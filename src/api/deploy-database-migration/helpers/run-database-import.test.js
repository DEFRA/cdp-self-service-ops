import { runDatabaseImport } from './run-database-import.js'

const mockInfoLogger = vi.fn()
const mockErrorLogger = vi.fn()
const mockDebugLogger = vi.fn()
const mockLogger = {
  info: mockInfoLogger,
  error: mockErrorLogger,
  debug: mockDebugLogger
}
const userId = '4bbc4178-28ee-4a2c-9a1b-2c5f174d228b'

const mockSNSClientSend = vi.fn()
const mockSNSClient = {
  send: mockSNSClientSend
}

vi.mock('@aws-sdk/client-sns', () => ({
  PublishCommand: vi.fn()
}))
vi.mock('../../../helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: (value) => mockInfoLogger(value),
    error: (value) => mockErrorLogger(value)
  })
}))

vi.mock('../../../helpers/logging/logger.js', () => ({}))

describe('#runDatabaseImport', () => {
  beforeEach(() => {
    mockSNSClientSend.mockResolvedValue({})
  })

  test('Should accept the request and trigger an sns message', async () => {
    await runDatabaseImport({
      service: 'some-service',
      environment: 'infra-dev',
      user: { id: userId, displayName: 'My Name' },
      dataFolder: 'some-service/foo/bar/',
      commands: ['pgrestore foo.sql'],
      snsClient: mockSNSClient,
      logger: mockLogger
    })
    expect(mockSNSClient.send).toHaveBeenCalledTimes(1)
  })
})
