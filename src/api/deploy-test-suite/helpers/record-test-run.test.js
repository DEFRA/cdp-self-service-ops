import { randomUUID } from 'node:crypto'

import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import { recordTestRun } from '~/src/api/deploy-test-suite/helpers/record-test-run.js'
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
      recordTestRun({
        imageName: 'some-service',
        environment: 'infra-dev',
        cpu: '4096',
        memory: '8192',
        user: { id: randomUUID(), displayName: 'My Name' },
        tag: '1.1.0',
        runId: randomUUID(),
        configCommitSha:
          'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
      })
    ).not.toThrow()
  })

  test('Should throw error when required fields are missing', async () => {
    await expect(
      recordTestRun({
        imageName: 'some-service',
        environment: 'infra-dev',
        cpu: '4096',
        user: { id: randomUUID(), displayName: 'My Name' },
        tag: '1.1.0',
        runId: randomUUID()
      })
    ).rejects.toThrow('"memory" is required')
  })

  test('Should generate correct request body', async () => {
    const mockRunId = randomUUID()
    config.get = vi.fn().mockReturnValue('http://fake-backend')

    const userId = randomUUID()
    await recordTestRun({
      imageName: 'some-service',
      environment: 'infra-dev',
      cpu: '4096',
      memory: '8192',
      user: { id: userId, displayName: 'My Name' },
      tag: '1.1.0',
      runId: mockRunId,
      configCommitSha:
        'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
    })

    expect(fetcher).toHaveBeenCalledWith(
      'http://fake-backend/test-run',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testSuite: 'some-service',
          environment: 'infra-dev',
          cpu: '4096',
          memory: '8192',
          user: { id: userId, displayName: 'My Name' },
          tag: '1.1.0',
          runId: mockRunId,
          configVersion:
            'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
        })
      })
    )
  })

  test('Should log expected message', async () => {
    await recordTestRun({
      imageName: 'some-service',
      environment: 'infra-dev',
      cpu: '4096',
      memory: '8192',
      user: { id: randomUUID(), displayName: 'My Name' },
      tag: '1.1.0',
      runId: randomUUID(),
      configCommitSha:
        'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
    })

    expect(mockInfoLogger).toHaveBeenCalledWith(
      expect.stringContaining('Recording test-run for some-service run')
    )
  })
})
