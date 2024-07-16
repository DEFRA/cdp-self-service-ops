import { generateDeployMessage } from '~/src/api/deploy/helpers/generate-deploy-message'
import { config } from '~/src/config'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message'

/**
 * @typedef {import("@aws-sdk/client-sns").SNSClient} SNSClient
 * @typedef {import("pino").Logger} Logger
 *
 * @param {string} deploymentId
 * @param {{imageName: string, version:string, environment: string, instanceCount: number, cpu: number, memory: number}} payload
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {string} configCommitSha
 * @param {string} serviceCode
 * @param {SNSClient} snsClient
 * @param {Logger} logger
 * @return {Promise<void>}
 */
async function sendSnsDeploymentMessage(
  deploymentId,
  payload,
  zone,
  user,
  configCommitSha,
  serviceCode,
  snsClient,
  logger
) {
  const deployMessage = await generateDeployMessage(
    deploymentId,
    payload.imageName,
    payload.version,
    payload.environment,
    zone,
    payload.instanceCount,
    payload.cpu,
    payload.memory,
    user,
    configCommitSha,
    serviceCode
  )

  const topic = config.get('snsDeployTopicArn')
  const snsResponse = await sendSnsMessage(snsClient, topic, deployMessage)

  logger.info(`SNS Deploy response: ${JSON.stringify(snsResponse, null, 2)}`)
}

export { sendSnsDeploymentMessage }
