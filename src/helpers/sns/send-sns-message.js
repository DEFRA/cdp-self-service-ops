import crypto from 'node:crypto'
import { PublishCommand } from '@aws-sdk/client-sns'

async function sendSnsMessage(
  snsClient,
  topic,
  message,
  logger,
  environment = message?.environment,
  deduplicationId = crypto.randomUUID(),
  messageGroupId = environment
) {
  const input = {
    TopicArn: topic,
    Message: JSON.stringify(message, null, 2),
    MessageAttributes: {
      environment: {
        DataType: 'String',
        StringValue: environment
      }
    }
  }

  if (topic.endsWith('fifo')) {
    input.MessageDeduplicationId = deduplicationId
    input.MessageGroupId = messageGroupId
  }

  const command = new PublishCommand(input)
  const snsResponse = await snsClient.send(command)

  logger.debug(snsResponse, `Sns message MessageId: ${snsResponse?.MessageId}`)

  return snsResponse
}

export { sendSnsMessage }
