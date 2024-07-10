import { generateDeployMessage } from '~/src/api/deploy/helpers/generate-deploy-message'
import { config } from '~/src/config'
import { sendSnsMessage } from '~/src/api/deploy/helpers/sns/send-sns-message'

async function sendSnsDeploymentMessage(
  deploymentId,
  payload,
  zone,
  user,
  configCommitSha,
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
    configCommitSha
  )

  const topic = config.get('snsDeployTopicArn')
  const snsResponse = await sendSnsMessage(snsClient, topic, deployMessage)

  logger.info(`SNS Deploy response: ${JSON.stringify(snsResponse, null, 2)}`)
}

export { sendSnsDeploymentMessage }
