import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient
} from '@aws-sdk/client-sqs'
import { appConfig } from '~/src/config'
import { createLogger } from '~/src/helpers/logger'
import { handle } from '~/src/listeners/github/message-handler'

const sqsClient = new SQSClient({
  region: appConfig.get('sqsRegion'),
  endpoint: appConfig.get('sqsEndpoint')
})

const queueUrl = appConfig.get('sqsGithubQueue')

const listen = async (server) => {
  const logger = createLogger()
  logger.info(`Listening for github webhook events on ${queueUrl}`)

  while (appConfig.get('sqsGithubEnabled')) {
    const params = {
      AttributeNames: ['SentTimestamp'],
      MaxNumberOfMessages: 1,
      MessageAttributeNames: ['All'],
      QueueUrl: queueUrl,
      VisibilityTimeout: 400,
      WaitTimeSeconds: 10
    }

    const { Messages } = await sqsClient.send(new ReceiveMessageCommand(params))

    for (const i in Messages) {
      const msg = Messages[i]

      try {
        const payload = JSON.parse(msg.Body)
        logger.info(`received msg: ${msg.ReceiptHandle}`)
        await handle(server, payload)
      } catch (ex) {
        logger.error(ex)
      } finally {
        const deleteParams = {
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle
        }
        await sqsClient.send(new DeleteMessageCommand(deleteParams))
      }
    }
  }
}

export { listen }