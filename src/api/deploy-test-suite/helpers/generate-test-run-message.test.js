import { generateTestRunMessage } from '~/src/api/deploy-test-suite/helpers/generate-test-run-message.js'
import crypto from 'node:crypto'
import { config } from '~/src/config/index.js'

describe('#generateTestRunMessage', () => {
  test('Schema should pass validation without errors', () => {
    config.get = jest.fn().mockReturnValue('http://fake-proxy')
    const message = generateTestRunMessage(
      'some-service',
      'infra-dev',
      crypto.randomUUID(),
      {
        userId: 'some-id',
        displayName: 'My Name'
      }
    )

    expect(message.deployed_by.userId).toBe('some-id')
  })
})
