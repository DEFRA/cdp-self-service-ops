import { SNSClient } from '@aws-sdk/client-sns'

import { config } from '~/src/config'

const snsClientPlugin = {
  name: 'sns-client',
  version: '1.0.0',
  register: async function (server) {
    server.logger.info('Setting up sns-client')

    const snsClient = new SNSClient({
      region: config.get('awsRegion'),
      endpoint: config.get('snsEndpoint')
    })

    server.logger.info('sns-client configured')
    server.decorate('request', 'snsClient', snsClient)
  }
}

export { snsClientPlugin }
