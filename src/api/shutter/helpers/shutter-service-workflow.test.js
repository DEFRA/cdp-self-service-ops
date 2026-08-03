import { shutterUrlType } from '../../../constants/waf.js'

const get = vi.fn()
const registerShuttering = vi.fn()
const sendSnsMessage = vi.fn()

vi.mock('#config/config.js', () => ({
  config: { get }
}))
vi.mock('./register-shuttering.js', () => ({
  registerShuttering
}))
vi.mock('../../../helpers/sns/send-sns-message.js', () => ({
  sendSnsMessage
}))

const topicArn = 'arn:aws:sns:eu-west-2:000000000000:mono-lambda-trigger-topic'

const configValues = () => (key) =>
  ({
    monoLambdaTriggerTopicArn: topicArn
  })[key]

const user = { id: 'some-user-id', displayName: 'Some User' }
const logger = { debug: vi.fn(), info: vi.fn() }
const snsClient = { send: vi.fn() }

const buildInputs = (overrides = {}) => ({
  serviceName: 'cdp-portal-frontend',
  environment: 'infra-dev',
  url: 'portal-test.cdp-int.defra.cloud',
  urlType: shutterUrlType.frontendVanityUrl,
  ...overrides
})

const publishedEvent = () => sendSnsMessage.mock.calls[0][2]

describe('#shutterServiceWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockImplementation(configValues())
  })

  test('publishes a slim payload for shutter requests', async () => {
    const { shutterServiceWorkflow } =
      await import('./shutter-service-workflow.js')
    const inputs = buildInputs({
      urlType: shutterUrlType.apigwVanityUrl,
      url: 'some-service.api.defra.gov.uk'
    })

    await shutterServiceWorkflow(inputs, user, logger, snsClient)

    expect(publishedEvent().payload).toEqual({
      action: 'shutter',
      fqdn: inputs.url,
      service_name: inputs.serviceName
    })
  })

  test('publishes a manage_shuttering event with MessageGroupId set to the fqdn', async () => {
    const { shutterServiceWorkflow } =
      await import('./shutter-service-workflow.js')
    const inputs = buildInputs()

    await shutterServiceWorkflow(inputs, user, logger, snsClient)

    expect(sendSnsMessage).toHaveBeenCalledWith(
      snsClient,
      topicArn,
      expect.objectContaining({
        event_type: 'manage_shuttering',
        timestamp: expect.any(String)
      }),
      logger,
      inputs.environment,
      undefined,
      inputs.url
    )
  })

  test('registers shuttering as shuttered', async () => {
    const { shutterServiceWorkflow } =
      await import('./shutter-service-workflow.js')
    const inputs = buildInputs()

    await shutterServiceWorkflow(inputs, user, logger, snsClient)

    expect(registerShuttering).toHaveBeenCalledWith({
      ...inputs,
      shuttered: true,
      actionedBy: user
    })
  })
})

describe('#unshutterServiceWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockImplementation(configValues())
  })

  test('publishes an unshutter manage_shuttering event', async () => {
    const { unshutterServiceWorkflow } =
      await import('./shutter-service-workflow.js')
    const inputs = buildInputs()

    await unshutterServiceWorkflow(inputs, user, logger, snsClient)

    expect(publishedEvent().payload).toEqual({
      action: 'unshutter',
      fqdn: inputs.url,
      service_name: inputs.serviceName
    })
  })

  test('registers shuttering as not shuttered', async () => {
    const { unshutterServiceWorkflow } =
      await import('./shutter-service-workflow.js')
    const inputs = buildInputs()

    await unshutterServiceWorkflow(inputs, user, logger, snsClient)

    expect(registerShuttering).toHaveBeenCalledWith({
      ...inputs,
      shuttered: false,
      actionedBy: user
    })
  })
})
