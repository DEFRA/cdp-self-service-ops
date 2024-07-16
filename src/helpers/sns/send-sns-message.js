import crypto from 'crypto'
import { PublishCommand } from '@aws-sdk/client-sns'

async function sendSnsMessage(request, topic, msg) {
  const { snsClient, logger } = request
  const input = {
    TopicArn: topic,
    Message: JSON.stringify(msg, null, 2),
    MessageAttributes: {
      environment: {
        DataType: 'String',
        StringValue: msg.environment
      }
    }
  }

  // At the time of writing localstack doesnt support fifo queues and will fail if you set these values on a non-fifo
  // queue. Luckily, AWS requires all fifo queues to end with `.fifo` so we can selectively add these params.
  if (topic.endsWith('fifo')) {
    input.MessageDeduplicationId = crypto.randomUUID()
    input.MessageGroupId = msg.environment
  }

  const command = new PublishCommand(input)
  const snsResponse = await snsClient.send(command)

  logger.debug(snsResponse, `Sns message MessageId: ${snsResponse?.MessageId}`)

  return snsResponse
}

export { sendSnsMessage }
