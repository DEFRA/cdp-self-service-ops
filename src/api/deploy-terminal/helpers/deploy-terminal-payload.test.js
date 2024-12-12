import { deployTerminalPayload } from '~/src/api/deploy-terminal/helpers/deploy-terminal-payload.js'

describe('#deployTerminalPayload', () => {
  test('should generate a valid payload', () => {
    const payload = deployTerminalPayload({
      environment: 'test',
      zone: 'public',
      service: 'service-name',
      token: '1234',
      user: { id: '9999-9999', displayName: 'User Name' }
    })

    const expected = {
      deployed_by: {
        displayName: 'User Name',
        id: '9999-9999'
      },
      environment: 'test',
      role: 'service-name',
      token: '1234',
      zone: 'public'
    }

    expect(payload).toEqual(expected)
  })
})
