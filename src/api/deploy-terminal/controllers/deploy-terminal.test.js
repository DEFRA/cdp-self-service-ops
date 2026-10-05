import { deployTerminal } from './deploy-terminal.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { generateTerminalToken } from '../helpers/generate-terminal-token.js'
import { recordTerminalSession } from '../helpers/record-terminal-session.js'

vi.mock('../../../helpers/sns/send-sns-message.js')
vi.mock('../../../helpers/portal-backend/get-entity.js')
vi.mock('../helpers/generate-terminal-token.js')
vi.mock('../helpers/record-terminal-session.js')

describe('#deploy-terminal', () => {
  it('Should send a valid payload to sns', async () => {
    getEntity.mockResolvedValue({
      environments: {
        dev: {
          tenant_config: {
            zone: 'public'
          }
        }
      }
    })

    const mockToken = '1234567890'
    generateTerminalToken.mockReturnValue(mockToken)

    recordTerminalSession.mockResolvedValue({})

    const logger = { info: vi.fn(), error: vi.fn() }

    const payload = {
      environment: 'dev',
      service: 'foo-frontend',
      zone: 'public',
      tool: 'terminal'
    }
    const user = {
      displayName: 'user name',
      id: '1234'
    }
    const scope = ['admin', 'serviceOwner:team:team-1']
    await deployTerminal(payload, user, logger, sendSnsMessage, scope)

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        deployed_by: {
          displayName: 'user name',
          id: '1234',
          scope
        },
        environment: 'dev',
        postgres: false,
        role: 'foo-frontend',
        service: 'foo-frontend',
        timeout: 28800,
        idle_timeout_seconds: 3600,
        token: '1234567890',
        zone: 'public'
      }),
      expect.anything()
    )

    expect(recordTerminalSession).toHaveBeenCalledWith({
      service: payload.service,
      environment: payload.environment,
      tool: payload.tool,
      user,
      token: mockToken
    })
  })

  it('Should default scope to an empty list when none is provided', async () => {
    getEntity.mockResolvedValue({
      environments: { dev: { tenant_config: { zone: 'public' } } }
    })
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'dev',
        service: 'foo-backend',
        zone: 'public',
        tool: 'terminal'
      },
      { displayName: 'user name', id: '1234' },
      logger,
      sendSnsMessage
    )

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        deployed_by: { displayName: 'user name', id: '1234', scope: [] }
      }),
      expect.anything()
    )
  })

  it('Should force postgres false for dbgate even when the service has sql', async () => {
    getEntity.mockResolvedValue({
      environments: {
        dev: {
          tenant_config: { zone: 'public' },
          sql_database: { arn: 'arn:aws:rds:example' }
        }
      }
    })
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'dev',
        service: 'foo-backend',
        zone: 'public',
        tool: 'dbgate'
      },
      { displayName: 'user name', id: '1234' },
      logger,
      sendSnsMessage
    )

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        postgres: false,
        image: 'cdp-dbgate',
        image_version: 'stable',
        timeout: 28800,
        role: 'foo-backend',
        service: 'foo-backend'
      }),
      expect.anything()
    )
  })

  it('Should limit the task lifetime to 2 hours in prod, with 1 hour idle timeout', async () => {
    getEntity.mockResolvedValue({
      environments: {
        prod: { tenant_config: { zone: 'protected' } }
      }
    })
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'prod',
        service: 'foo-backend',
        zone: 'protected',
        tool: 'pgweb'
      },
      { displayName: 'user name', id: '1234' },
      logger,
      sendSnsMessage
    )

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        environment: 'prod',
        timeout: 7200,
        idle_timeout_seconds: 3600
      }),
      expect.anything()
    )
  })

  it('Should keep postgres true for terminal when the service has sql', async () => {
    getEntity.mockResolvedValue({
      environments: {
        dev: {
          tenant_config: { zone: 'public' },
          sql_database: { arn: 'arn:aws:rds:example' }
        }
      }
    })
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'dev',
        service: 'foo-backend',
        zone: 'public',
        tool: 'terminal'
      },
      { displayName: 'user name', id: '1234' },
      logger,
      sendSnsMessage
    )

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        postgres: true,
        image: 'cdp-webshell',
        image_version: 'stable'
      }),
      expect.anything()
    )
  })
})
