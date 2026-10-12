import { deployTerminal, deployTerminalController } from './deploy-terminal.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { generateTerminalToken } from '../helpers/generate-terminal-token.js'
import { recordTerminalSession } from '../helpers/record-terminal-session.js'

vi.mock('../../../helpers/sns/send-sns-message.js')
vi.mock('../../../helpers/portal-backend/get-entity.js')
vi.mock('../helpers/generate-terminal-token.js')
vi.mock('../helpers/record-terminal-session.js')

describe('#deploy-terminal', () => {
  it('Should send a valid payload to sns', async () => {
    const entity = {
      environments: {
        dev: {
          tenant_config: {
            zone: 'public'
          }
        }
      }
    }

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
    await deployTerminal(payload, entity, user, logger, sendSnsMessage, scope)

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
    const entity = {
      environments: { dev: { tenant_config: { zone: 'public' } } }
    }
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'dev',
        service: 'foo-backend',
        zone: 'public',
        tool: 'terminal'
      },
      entity,
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
    const entity = {
      environments: {
        dev: {
          tenant_config: { zone: 'public' },
          sql_database: { arn: 'arn:aws:rds:example' }
        }
      }
    }
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'dev',
        service: 'foo-backend',
        zone: 'public',
        tool: 'dbgate'
      },
      entity,
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
    const entity = {
      environments: {
        prod: { tenant_config: { zone: 'protected' } }
      }
    }
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'prod',
        service: 'foo-backend',
        zone: 'protected',
        tool: 'pgweb'
      },
      entity,
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
    const entity = {
      environments: {
        dev: {
          tenant_config: { zone: 'public' },
          sql_database: { arn: 'arn:aws:rds:example' }
        }
      }
    }
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'dev',
        service: 'foo-backend',
        zone: 'public',
        tool: 'terminal'
      },
      entity,
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

  it('Should include environment resources and disable postgres for sqs tool', async () => {
    const entity = {
      environments: {
        dev: {
          tenant_config: { zone: 'public' },
          sql_database: { arn: 'arn:aws:rds:example' },
          sqs_queues: [
            {
              name: 'orders',
              arn: 'arn:aws:sqs:eu-west-2:123456789012:orders',
              url: 'https://sqs.eu-west-2.amazonaws.com/123456789012/orders',
              deadletter_queue_arn:
                'arn:aws:sqs:eu-west-2:123456789012:orders-deadletter'
            },
            {
              name: 'missing-dlq',
              arn: 'arn:aws:sqs:eu-west-2:123456789012:missing-dlq',
              url: 'https://sqs.eu-west-2.amazonaws.com/123456789012/missing-dlq'
            }
          ]
        }
      }
    }
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'dev',
        service: 'foo-backend',
        zone: 'public',
        teamIds: ['team-1'],
        tool: 'sqs_tool'
      },
      entity,
      { displayName: 'user name', id: '1234' },
      logger,
      sendSnsMessage,
      ['permission:serviceOwner:team:team-1']
    )

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        postgres: false,
        image: 'cdp-aws-tools',
        image_version: 'stable',
        show_message_content: true,
        allow_purge: true,
        resources: entity.environments.dev
      }),
      expect.anything()
    )
    expect(logger.warn).toHaveBeenCalled()
  })

  it('Should reject sqs tool when sqs_queues is null', async () => {
    const entity = {
      environments: {
        dev: { tenant_config: { zone: 'public' }, sqs_queues: null }
      }
    }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    await expect(
      deployTerminal(
        { environment: 'dev', service: 'foo-backend', tool: 'sqs_tool' },
        entity,
        { displayName: 'user name', id: '1234' },
        logger,
        sendSnsMessage
      )
    ).rejects.toThrow('No queues with a dead letter queue')
  })

  it('Should hide sqs message content in prod without breakglass', async () => {
    const entity = {
      environments: {
        prod: {
          tenant_config: { zone: 'protected' },
          sqs_queues: [
            {
              name: 'orders',
              arn: 'arn:aws:sqs:eu-west-2:123456789012:orders',
              url: 'https://sqs.eu-west-2.amazonaws.com/123456789012/orders',
              deadletter_queue_arn:
                'arn:aws:sqs:eu-west-2:123456789012:orders-deadletter'
            }
          ]
        }
      }
    }
    generateTerminalToken.mockReturnValue('1234567890')
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    await deployTerminal(
      {
        environment: 'prod',
        service: 'foo-backend',
        zone: 'protected',
        teamIds: ['team-1'],
        tool: 'sqs_tool'
      },
      entity,
      { displayName: 'user name', id: '1234' },
      logger,
      sendSnsMessage,
      ['permission:serviceOwner:team:team-1']
    )

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        show_message_content: false,
        allow_purge: false
      }),
      expect.anything()
    )
  })

  describe('sqs tool in prod', () => {
    const queue = {
      name: 'orders',
      arn: 'arn:aws:sqs:eu-west-2:123456789012:orders',
      url: 'https://sqs.eu-west-2.amazonaws.com/123456789012/orders',
      deadletter_queue_arn:
        'arn:aws:sqs:eu-west-2:123456789012:orders-deadletter'
    }
    const prodEntity = (queues) => ({
      teams: [{ teamId: 'team-1' }],
      environments: {
        prod: { tenant_config: { zone: 'protected' }, sqs_queues: queues }
      }
    })
    const user = { displayName: 'user name', id: '1234' }
    const launch = (entity, scope, payload = {}) =>
      deployTerminal(
        {
          environment: 'prod',
          service: 'foo-backend',
          tool: 'sqs_tool',
          ...payload
        },
        entity,
        user,
        { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        sendSnsMessage,
        scope
      )

    beforeEach(() => {
      vi.clearAllMocks()
      generateTerminalToken.mockReturnValue('1234567890')
    })

    it('Should show message content with break glass for an owning team', async () => {
      await launch(prodEntity([queue]), ['permission:breakGlass:team:team-1'])

      expect(sendSnsMessage).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          show_message_content: true,
          allow_purge: true
        }),
        expect.anything()
      )
    })

    it('Should show purge with general break glass access', async () => {
      await launch(prodEntity([queue]), ['permission:breakGlass'])

      expect(sendSnsMessage).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          show_message_content: true,
          allow_purge: true
        }),
        expect.anything()
      )
    })

    it('Should ignore teamIds from the payload when checking break glass', async () => {
      await launch(prodEntity([queue]), ['permission:breakGlass:team:other'], {
        teamIds: ['other']
      })

      expect(sendSnsMessage).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          show_message_content: false,
          allow_purge: false
        }),
        expect.anything()
      )
    })

    it('Should reject when no queue has both an arn and a dead letter queue', async () => {
      const { arn, ...queueWithoutArn } = queue

      await expect(launch(prodEntity([queueWithoutArn]), [])).rejects.toThrow(
        'No queues with a dead letter queue for foo-backend in prod'
      )
      expect(sendSnsMessage).not.toHaveBeenCalled()
    })

    it('Should clamp expiresAt to the prod max lifetime', async () => {
      await launch(prodEntity([queue]), [], {
        expiresAt: new Date('2099-01-01T00:00:00Z')
      })

      expect(sendSnsMessage).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ timeout: 7200 }),
        expect.anything()
      )
    })
  })

  describe('controller', () => {
    const request = (scope, payload) => ({
      payload: {
        environment: 'prod',
        service: 'foo-backend',
        tool: 'sqs_tool',
        ...payload
      },
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      auth: { credentials: { id: '1234', displayName: 'user name', scope } },
      snsClient: {}
    })

    it('Should authorise against the entity teams, not teamIds from the payload', async () => {
      getEntity.mockResolvedValue({
        teams: [{ teamId: 'team-1' }],
        environments: { prod: { tenant_config: { zone: 'protected' } } }
      })

      await expect(
        deployTerminalController.handler(
          request(
            ['permission:betaTester', 'permission:serviceOwner:team:other'],
            { teamIds: ['other'] }
          )
        )
      ).rejects.toThrow(
        'Insufficient permissions to launch a terminal in this environment'
      )
    })
  })
})
