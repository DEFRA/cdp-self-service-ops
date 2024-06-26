import { Consumer } from 'sqs-consumer'
import { SQSClient } from '@aws-sdk/client-sqs'

import { config } from '~/src/config'
import { handle } from '~/src/listeners/github/message-handler'

function sqsListener(server) {
  const queueUrl = config.get('sqsGitHubQueue')

  server.logger.info(`Listening for gitHub webhook events on ${queueUrl}`)

  const sqs = new SQSClient({
    region: config.get('awsRegion'),
    endpoint: config.get('sqsEndpoint')
  })

  const listener = Consumer.create({
    queueUrl,
    attributeNames: ['SentTimestamp'],
    messageAttributeNames: ['All'],
    waitTimeSeconds: 10,
    visibilityTimeout: 400,
    pollingWaitTimeMs: 0,
    handleMessage: async (message) => {
      const payload = JSON.parse(message.Body)
      await handle(server, payload)
      listener.updateOption('pollingWaitTimeMs', 0)
      return message
    },
    sqs
  })

  listener.on('error', (error) => {
    server.logger.error(error.message)
    listener.updateOption('pollingWaitTimeMs', 2000)
  })

  listener.on('processing_error', (error) => {
    server.logger.error(error.message)
  })

  listener.on('timeout_error', (error) => {
    server.logger.error(error.message)
  })

  listener.start()

  return listener
}

export { sqsListener }
