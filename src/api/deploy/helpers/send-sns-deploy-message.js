import { PublishCommand } from '@aws-sdk/client-sns'

import { config } from '~/src/config'

async function sendSnsDeployMessage(snsClient, msg) {
  const input = {
    TopicArn: config.get('snsDeployTopicArn'),
    Message: JSON.stringify(msg, null, 2),
    MessageAttributes: {
      environment: {
        DataType: 'String',
        StringValue: msg.environment
      }
    },
    MessageDeduplicationId: `${msg.environment}-${msg.container_image}-${msg.container_version}`,
    MessageGroupId: msg.environment
  }
  const command = new PublishCommand(input)
  return await snsClient.send(command)
}

export { sendSnsDeployMessage }
