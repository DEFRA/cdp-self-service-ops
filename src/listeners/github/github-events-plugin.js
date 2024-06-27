import { sqsListener } from '~/src/listeners/github/sqs-listener'

const gitHubEventsPlugin = {
  plugin: {
    name: 'gitHubEventsPlugin',
    version: '1.0.0',
    register: function (server) {
      sqsListener(server)
    }
  }
}

export { gitHubEventsPlugin }
