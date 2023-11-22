import { sqsListener } from '~/src/listeners/github/sqs-listener'

const githubEventsPlugin = {
  plugin: {
    name: 'githubEventsPlugin',
    version: '1.0.0',
    register: function (server) {
      sqsListener(server)
    }
  }
}

export { githubEventsPlugin }
