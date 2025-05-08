import { deployTerminalPayload } from '~/src/api/deploy-terminal/helpers/deploy-terminal-payload.js'

describe('#deployTerminalPayload', () => {
  test('should generate a valid payload', () => {
    const payload = deployTerminalPayload({
      environment: 'test',
      zone: 'public',
      role: 'service-name',
      token: '1234',
      useDDL: false,
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

  test('deploy with DDL user', () => {
    const payload = deployTerminalPayload({
      environment: 'test',
      zone: 'public',
      role: 'service-name',
      token: '1234',
      useDDL: true,
      user: { id: '9999-9999', displayName: 'User Name' }
    })

    const expected = {
      deployed_by: {
        displayName: 'User Name',
        id: '9999-9999'
      },
      environment: 'test',
      role: 'service-name-ddl',
      token: '1234',
      zone: 'public'
    }

    expect(payload).toEqual(expected)
  })

  test('deploy with non-DDL user when postgresl is missing', () => {
    const payload = deployTerminalPayload({
      environment: 'test',
      zone: 'public',
      role: 'service-name',
      token: '1234',
      useDDL: undefined,
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
