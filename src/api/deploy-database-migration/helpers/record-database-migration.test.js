import { randomUUID } from 'node:crypto'

import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import { recordDatabaseMigration } from '~/src/api/deploy-database-migration/helpers/record-database-migration.js'
import { vi } from 'vitest'

const mockInfoLogger = vi.fn()

vi.mock('~/src/helpers/fetcher.js')
vi.mock('~/src/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: (value) => mockInfoLogger(value)
  })
}))

describe('#recordTestRun', () => {
  test('Schema should pass validation without errors', () => {
    fetcher.mockResolvedValue({})

    expect(() =>
      recordDatabaseMigration({
        service: 'some-service',
        environment: 'infra-dev',
        user: { id: randomUUID(), displayName: 'My Name' },
        version: '1.1.0',
        cdpMigrationId: randomUUID()
      })
    ).not.toThrow()
  })

  test('Should throw error when required fields are missing', async () => {
    await expect(
      recordDatabaseMigration({
        service: 'some-service',
        environment: 'infra-dev',
        user: { id: randomUUID(), displayName: 'My Name' },
        version: '1.1.0'
      })
    ).rejects.toThrow('"cdpMigrationId" is required')
  })

  test('Should generate correct request body', async () => {
    const mockRunId = randomUUID()
    config.get = vi.fn().mockReturnValue('http://fake-backend')

    const userId = randomUUID()
    await recordDatabaseMigration({
      cdpMigrationId: mockRunId,
      service: 'some-service',
      environment: 'infra-dev',
      version: '1.1.0',
      user: { id: userId, displayName: 'My Name' }
    })

    // Note: this is fragile, body check assumes field ordering.
    expect(fetcher).toHaveBeenCalledWith(
      'http://fake-backend/migrations/runs',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cdpMigrationId: mockRunId,
          service: 'some-service',
          version: '1.1.0',
          environment: 'infra-dev',
          user: { id: userId, displayName: 'My Name' }
        })
      })
    )
  })
})
