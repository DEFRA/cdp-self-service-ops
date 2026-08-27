import { sendSnsMessage } from '../sns/send-sns-message.js'
import { config } from '#config/config.js'

/**
 *
 * @param {{ snsClient: {}, logger: {} }} request
 * @param {string} eventType
 * @param {string} environment
 * @param {{}} payload
 * @return {Promise<*>}
 */
export async function triggerMonoLambda(
  request,
  eventType,
  environment,
  payload
) {
  const topic = config.get('monoLambdaTriggerTopicArn')
  return await sendSnsMessage(
    request.snsClient,
    topic,
    {
      event_type: 'publish_environment_state',
      timestamp: new Date().toISOString(),
      payload
    },
    request.logger,
    environment
  )
}
