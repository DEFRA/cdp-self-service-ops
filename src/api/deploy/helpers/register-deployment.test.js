import crypto from 'node:crypto'
import { config } from '~/src/config/index.js'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment.js'
import * as Promise from 'eslint-import-resolver-typescript'

describe('#registerDeployment', () => {
  test('Schema should pass validation without errors', async () => {
    config.get = jest.fn().mockReturnValue('http://fake-proxy')
    global.fetch = jest.fn(() => Promise.resolve('test'))
    await registerDeployment(
      'some-service',
      '0.0.1',
      'infra-dev',
      5,
      1024,
      2048,
      {
        id: 'some-id',
        displayName: 'My Name'
      },
      crypto.randomUUID(),
      'abc123'
    )

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
