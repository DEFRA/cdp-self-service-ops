import { SQSClient } from '@aws-sdk/client-sqs'

import { config } from '../config/index.js'

const sqsClient = {
  plugin: {
    name: 'sqsClient',
    version: '0.1.0',
    register: (server) => {
      const client = new SQSClient({
        region: config.get('awsRegion'),
        endpoint: config.get('sqsEndpoint')
      })

      server.decorate('server', 'sqs', client)

      server.events.on('stop', () => {
        server.logger.info(`Closing SQS client`)
        client.destroy()
      })
    }
  }
}

export { sqsClient }
