import { shutterUrlType } from '../../../constants/waf.js'

const get = vi.fn()
const triggerWorkflow = vi.fn()
const registerShuttering = vi.fn()
const sendSnsMessage = vi.fn()

vi.mock('#config/config.js', () => ({
  config: { get }
}))
vi.mock('../../../helpers/github/trigger-workflow.js', () => ({
  triggerWorkflow
}))
vi.mock('./register-shuttering.js', () => ({
  registerShuttering
}))
vi.mock('../../../helpers/sns/send-sns-message.js', () => ({
  sendSnsMessage
}))

const topicArn = 'arn:aws:sns:eu-west-2:000000000000:mono-lambda-trigger-topic'

const configValues = (shutterV2Environments) => (key) =>
  ({
    shutterV2Environments,
    monoLambdaTriggerTopicArn: topicArn,
    'github.org': 'DEFRA',
    'github.repos.cdpTenantConfig': 'cdp-tenant-config',
    'workflows.addShutterWorkflow': 'create-shuttering.yml',
    'workflows.removeShutterWorkflow': 'remove-shuttering.yml'
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
  })

  describe('when shutter v2 is enabled for the environment', () => {
    beforeEach(() => {
      get.mockImplementation(configValues('infra-dev'))
    })

    describe('web ACL and shutter type routing', () => {
      test.each([
        [
          'frontend vanity url on internal domain',
          shutterUrlType.frontendVanityUrl,
          'portal-test.cdp-int.defra.cloud',
          'www',
          'cdp-platform-acl-public-internal'
        ],
        [
          'frontend vanity url on external domain',
          shutterUrlType.frontendVanityUrl,
          'portal.defra.gov.uk',
          'www',
          'cdp-platform-acl-public-external'
        ],
        [
          'api gateway vanity url on internal domain',
          shutterUrlType.apigwVanityUrl,
          'some-service.api.infra-dev.cdp-int.defra.cloud',
          'api',
          'cdp-platform-api-acl-private'
        ],
        [
          'api gateway vanity url on external domain',
          shutterUrlType.apigwVanityUrl,
          'some-service.api.defra.gov.uk',
          'api',
          'cdp-platform-api-acl-public'
        ]
      ])(
        'routes %s to the expected ACL',
        async (_description, urlType, url, expectedShutterType, expectedAcl) => {
          const { shutterServiceWorkflow } = await import(
            './shutter-service-workflow.js'
          )
          const inputs = buildInputs({ urlType, url })

          await shutterServiceWorkflow(inputs, user, logger, snsClient)

          expect(publishedEvent().payload).toEqual({
            action: 'shutter',
            fqdn: url,
            service_name: inputs.serviceName,
            shutter_type: expectedShutterType,
            web_acl_name: expectedAcl
          })
        }
      )
    })

    test('publishes a manage_shuttering event with MessageGroupId set to the fqdn', async () => {
      const { shutterServiceWorkflow } = await import(
        './shutter-service-workflow.js'
      )
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
      expect(triggerWorkflow).not.toHaveBeenCalled()
    })

    test('registers shuttering as shuttered', async () => {
      const { shutterServiceWorkflow } = await import(
        './shutter-service-workflow.js'
      )
      const inputs = buildInputs()

      await shutterServiceWorkflow(inputs, user, logger, snsClient)

      expect(registerShuttering).toHaveBeenCalledWith({
        ...inputs,
        shuttered: true,
        actionedBy: user
      })
    })
  })

  describe('when shutter v2 is not enabled for the environment', () => {
    beforeEach(() => {
      get.mockImplementation(configValues(''))
    })

    test('triggers the github workflow and does not publish to sns', async () => {
      const { shutterServiceWorkflow } = await import(
        './shutter-service-workflow.js'
      )
      const inputs = buildInputs()

      await shutterServiceWorkflow(inputs, user, logger, snsClient)

      expect(triggerWorkflow).toHaveBeenCalledWith(
        'DEFRA',
        'cdp-tenant-config',
        'create-shuttering.yml',
        {
          service_name: inputs.serviceName,
          environment: inputs.environment,
          url: inputs.url,
          url_type: inputs.urlType
        },
        inputs.url,
        logger
      )
      expect(sendSnsMessage).not.toHaveBeenCalled()
      expect(registerShuttering).toHaveBeenCalledWith({
        ...inputs,
        shuttered: true,
        actionedBy: user
      })
    })
  })
})

describe('#unshutterServiceWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when shutter v2 is enabled for the environment', () => {
    beforeEach(() => {
      get.mockImplementation(configValues('infra-dev'))
    })

    test('publishes an unshutter manage_shuttering event', async () => {
      const { unshutterServiceWorkflow } = await import(
        './shutter-service-workflow.js'
      )
      const inputs = buildInputs()

      await unshutterServiceWorkflow(inputs, user, logger, snsClient)

      expect(publishedEvent().payload).toEqual({
        action: 'unshutter',
        fqdn: inputs.url,
        service_name: inputs.serviceName,
        shutter_type: 'www',
        web_acl_name: 'cdp-platform-acl-public-internal'
      })
      expect(triggerWorkflow).not.toHaveBeenCalled()
    })

    test('registers shuttering as not shuttered', async () => {
      const { unshutterServiceWorkflow } = await import(
        './shutter-service-workflow.js'
      )
      const inputs = buildInputs()

      await unshutterServiceWorkflow(inputs, user, logger, snsClient)

      expect(registerShuttering).toHaveBeenCalledWith({
        ...inputs,
        shuttered: false,
        actionedBy: user
      })
    })
  })

  describe('when shutter v2 is not enabled for the environment', () => {
    beforeEach(() => {
      get.mockImplementation(configValues(''))
    })

    test('triggers the github remove workflow and does not publish to sns', async () => {
      const { unshutterServiceWorkflow } = await import(
        './shutter-service-workflow.js'
      )
      const inputs = buildInputs()

      await unshutterServiceWorkflow(inputs, user, logger, snsClient)

      expect(triggerWorkflow).toHaveBeenCalledWith(
        'DEFRA',
        'cdp-tenant-config',
        'remove-shuttering.yml',
        {
          service_name: inputs.serviceName,
          environment: inputs.environment,
          url: inputs.url,
          url_type: inputs.urlType
        },
        inputs.url,
        logger
      )
      expect(sendSnsMessage).not.toHaveBeenCalled()
      expect(registerShuttering).toHaveBeenCalledWith({
        ...inputs,
        shuttered: false,
        actionedBy: user
      })
    })
  })
})
