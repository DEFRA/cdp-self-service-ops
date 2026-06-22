import { generateLambdaDeployment } from './generate-deployment.js'
import { sendSnsMessage } from '../sns/send-sns-message.js'
import { config } from '#config/config.js'

/**
 * Triggers a CDP deployment directly via the deployment lambda
 * @param {{}} deploymentRequest
 * @param {string} environment
 * @param {import("@aws-sdk/client-sns").SNSClient} snsClient
 * @param {import("pino").Logger} logger
 * @return {Promise<void>}
 */
export async function triggerDeployment(
  deploymentRequest,
  environment,
  snsClient,
  logger
) {
  const topic = config.get('snsDeployTopicArn')
  const message = generateLambdaDeployment(deploymentRequest)

  logger.info(
    `Deploying ${message.name}:${message.container_version} to ${environment} via deployment lambda topic ${topic}`
  )

  await sendSnsMessage(snsClient, topic, message, logger, environment)
}
