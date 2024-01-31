import { PublishCommand } from '@aws-sdk/client-sns'

import * as crypto from 'crypto'

async function sendSnsDeployMessage(snsClient, topic, msg) {
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
  return await snsClient.send(command)
}

export { sendSnsDeployMessage }
