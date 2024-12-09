import { config } from '~/src/config/index.js'
import { createAppAuth } from '@octokit/auth-app'
import { graphql as octokitGraphql } from '@octokit/graphql'
import { proxyFetch } from '~/src/helpers/proxy/proxy-fetch.js'

const auth = {
  appId: config.get('github.app.id'),
  privateKey: Buffer.from(config.get('github.app.privateKey'), 'base64'),
  installationId: config.get('github.app.installationId')
}
const authApp = createAppAuth(auth)

const graphql = octokitGraphql.defaults(
  config.get('github.baseUrl') == null
    ? {
        request: {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          hook: authApp.hook,
          fetch: proxyFetch
        }
      }
    : {
        headers: {
          authorization: 'test-value'
        },
        baseUrl: config.get('github.baseUrl')
      }
)

export { graphql }
