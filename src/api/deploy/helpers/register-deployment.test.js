import { randomUUID } from 'node:crypto'
import { config } from '~/src/config/index.js'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment.js'

describe('#registerDeployment', () => {
  test('Schema should pass validation without errors', async () => {
    config.get = jest.fn().mockReturnValue('http://fake-proxy')
    global.fetch = jest.fn().mockResolvedValue('test')
    await registerDeployment(
      'some-service',
      '0.0.1',
      'infra-dev',
      5,
      1024,
      2048,
      {
        id: randomUUID(),
        displayName: 'My Name'
      },
      randomUUID(),
      'abc123'
    )

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
