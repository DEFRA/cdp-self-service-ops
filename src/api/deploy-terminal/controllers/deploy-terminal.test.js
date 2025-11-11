import { deployTerminal } from './deploy-terminal.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { generateTerminalToken } from '../helpers/generate-terminal-token.js'

describe('#deploy-terminal', () => {
  vi.mock('../../../helpers/sns/send-sns-message.js')
  vi.mock('../../../helpers/portal-backend/get-entity.js')
  vi.mock('../helpers/generate-terminal-token.js')

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

    generateTerminalToken.mockReturnValue('1234567890')

    const logger = { info: vi.fn(), error: vi.fn() }

    const payload = {
      environment: 'dev',
      service: 'foo-frontend',
      zone: 'public'
    }
    const user = {
      displayName: 'user name',
      id: '1234'
    }
    await deployTerminal(payload, user, logger, sendSnsMessage)

    expect(sendSnsMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        deployed_by: {
          displayName: 'user name',
          id: '1234'
        },
        environment: 'dev',
        postgres: false,
        role: 'foo-frontend',
        service: 'foo-frontend',
        timeout: 7200,
        token: '1234567890',
        zone: 'public'
      }),
      expect.anything()
    )
  })
})
