import { config } from '#config/config.js'
import { triggerWorkflow } from '../../../helpers/github/trigger-workflow.js'
import { registerShuttering } from './register-shuttering.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { shouldUseShutterV2 } from './should-use-shutter-v2.js'
import { shutterUrlType } from '../../../constants/waf.js'

const buildWorkFlowInputs = (inputs) => ({
  service_name: inputs.serviceName,
  environment: inputs.environment,
  url: inputs.url,
  url_type: inputs.urlType
})

const INTERNAL_DOMAIN_SUFFIX = '.cdp-int.defra.cloud'

function resolveManageShutteringRouting({ urlType, url }) {
  const isInternal = url.endsWith(INTERNAL_DOMAIN_SUFFIX)

  if (urlType === shutterUrlType.frontendVanityUrl) {
    return {
      shutterType: 'www',
      webAclName: isInternal
        ? 'cdp-platform-acl-public-internal'
        : 'cdp-platform-acl-public-external'
    }
  }

  return {
    shutterType: 'api',
    webAclName: isInternal
      ? 'cdp-platform-api-acl-private'
      : 'cdp-platform-api-acl-public'
  }
}

async function publishManageShutteringEvent(inputs, action, snsClient, logger) {
  const topic = config.get('monoLambdaTriggerTopicArn')
  const { shutterType, webAclName } = resolveManageShutteringRouting(inputs)

  const event = {
    event_type: 'manage_shuttering',
    timestamp: new Date().toISOString(),
    payload: {
      action,
      fqdn: inputs.url,
      service_name: inputs.serviceName,
      shutter_type: shutterType,
      web_acl_name: webAclName
    }
  }

  await sendSnsMessage(
    snsClient,
    topic,
    event,
    logger,
    inputs.environment,
    undefined,
    inputs.url
  )
}

async function shutterServiceWorkflow(inputs, user, logger, snsClient) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTenantConfig')
  const workflow = config.get('workflows.addShutterWorkflow')

  if (shouldUseShutterV2(inputs.environment)) {
    await publishManageShutteringEvent(inputs, 'shutter', snsClient, logger)
  } else {
    await triggerWorkflow(
      org,
      repo,
      workflow,
      buildWorkFlowInputs(inputs),
      inputs.url,
      logger
    )
  }

  await registerShuttering({ ...inputs, shuttered: true, actionedBy: user })
}

async function unshutterServiceWorkflow(inputs, user, logger, snsClient) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTenantConfig')
  const workflow = config.get('workflows.removeShutterWorkflow')

  if (shouldUseShutterV2(inputs.environment)) {
    await publishManageShutteringEvent(inputs, 'unshutter', snsClient, logger)
  } else {
    await triggerWorkflow(
      org,
      repo,
      workflow,
      buildWorkFlowInputs(inputs),
      inputs.url,
      logger
    )
  }

  await registerShuttering({ ...inputs, shuttered: false, actionedBy: user })
}

export { shutterServiceWorkflow, unshutterServiceWorkflow }
