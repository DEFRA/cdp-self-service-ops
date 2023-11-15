import { listen } from '~/src/listeners/github/sqs-listener'

const githubEventsPlugin = {
  name: 'githubEventsPlugin',
  version: '1.0.0',
  register: async function (server) {
    // start the listener but do not await its completion
    listen(server)
  }
}

export { githubEventsPlugin }
