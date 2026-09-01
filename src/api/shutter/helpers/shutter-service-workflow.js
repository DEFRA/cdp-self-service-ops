import { config } from '#config/config.js'
import { registerShuttering } from './register-shuttering.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'

async function publishManageShutteringEvent(inputs, action, snsClient, logger) {
  const topic = config.get('monoLambdaTriggerTopicArn')

  const event = {
    event_type: 'manage_shuttering',
    timestamp: new Date().toISOString(),
    payload: {
      action,
      fqdn: inputs.url,
      service_name: inputs.serviceName
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
  await publishManageShutteringEvent(inputs, 'shutter', snsClient, logger)

  await registerShuttering({ ...inputs, shuttered: true, actionedBy: user })
}

async function unshutterServiceWorkflow(inputs, user, logger, snsClient) {
  await publishManageShutteringEvent(inputs, 'unshutter', snsClient, logger)

  await registerShuttering({ ...inputs, shuttered: false, actionedBy: user })
}

export { shutterServiceWorkflow, unshutterServiceWorkflow }
