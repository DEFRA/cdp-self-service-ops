import { listen } from '~/src/listeners/github/sqs-listener'

const githubEventsPlugin = {
  name: 'githubEventsPlugin',
  version: '1.0.0',
  register: async function (server) {
    await listen(server)
  }
}

export { githubEventsPlugin }
