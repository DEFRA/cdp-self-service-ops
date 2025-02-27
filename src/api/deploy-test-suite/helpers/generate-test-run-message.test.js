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
        id: 'some-id',
        displayName: 'My Name'
      },
      'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
    )

    expect(message.deployed_by.userId).toBe('some-id')
  })
})
