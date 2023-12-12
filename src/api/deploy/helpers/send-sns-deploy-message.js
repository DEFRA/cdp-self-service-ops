import { PublishCommand } from '@aws-sdk/client-sns'

import { config } from '~/src/config'
import * as crypto from 'crypto'

async function sendSnsDeployMessage(snsClient, msg) {
  const topic = config.get('snsDeployTopicArn')
  const input = {
    TopicArn: config.get('snsDeployTopicArn'),
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
