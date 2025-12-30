import { randomUUID } from 'node:crypto'

import { fetcher } from '../../../helpers/fetcher.js'
import { recordTerminalSession } from './record-terminal-session.js'

vi.mock('../../../helpers/fetcher.js')

describe('#recordTestRun', () => {
  test('Schema should pass validation without errors', async () => {
    fetcher.mockResolvedValue({})

    expect(() =>
      recordTerminalSession({
        service: 'some-service',
        environment: 'infra-dev',
        user: { id: randomUUID(), displayName: 'My Name' },
        token: '1234'
      })
    ).not.toThrow()
  })

  test('Should throw error when required fields are missing', () => {
    expect(() =>
      recordTerminalSession({
        service: 'some-service',
        environment: 'infra-dev',
        user: { id: randomUUID(), displayName: 'My Name' }
      })
    ).toThrow('"token" is required')
  })

  test('Should generate correct request body', async () => {
    fetcher.mockResolvedValue({})

    const payload = {
      service: 'some-service',
      environment: 'infra-dev',
      user: { id: randomUUID(), displayName: 'My Name' },
      token: '1234'
    }
    await recordTerminalSession(payload)

    expect(fetcher).toHaveBeenCalledWith('http://localhost:5094/terminals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  })
})
