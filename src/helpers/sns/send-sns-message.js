import crypto from 'node:crypto'
import { PublishCommand } from '@aws-sdk/client-sns'

async function sendSnsMessage({
  request,
  topic,
  message,
  environment = message?.environment,
  deduplicationId = crypto.randomUUID()
}) {
  const { snsClient, logger } = request
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

  // At the time of writing localstack doesnt support fifo queues and will fail if you set these values on a non-fifo
  // queue. Luckily, AWS requires all fifo queues to end with `.fifo` so we can selectively add these params.
  if (topic.endsWith('fifo')) {
    input.MessageDeduplicationId = deduplicationId
    input.MessageGroupId = environment
  }

  const command = new PublishCommand(input)
  const snsResponse = await snsClient.send(command)

  logger.debug(snsResponse, `Sns message MessageId: ${snsResponse?.MessageId}`)

  return snsResponse
}

export { sendSnsMessage }
