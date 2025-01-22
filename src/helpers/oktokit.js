import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'

import { createPullRequest } from 'octokit-plugin-create-pull-request'
import { config } from '~/src/config/index.js'
import { proxyFetch } from '~/src/helpers/proxy/proxy-fetch.js'
import { graphql as octokitGraphql } from '@octokit/graphql'

const auth = {
  appId: config.get('github.app.id'),
  privateKey: Buffer.from(
    config.get('github.app.privateKey'),
    'base64'
  ).toString('utf8'),
  installationId: config.get('github.app.installationId')
}

const OctokitExtra = Octokit.plugin(restEndpointMethods, createPullRequest)
const baseUrl = config.get('github.baseUrl')

const authApp = createAppAuth(auth)

const octokit = new OctokitExtra(
  baseUrl == null
    ? {
        authStrategy: createAppAuth,
        auth,
        request: { fetch: proxyFetch }
      }
    : // Test Mode, for use with cdp-portal-stubs
      {
        auth: 'test-value',
        baseUrl
      }
)

const graphql = octokitGraphql.defaults(
  baseUrl == null
    ? {
        request: {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          hook: authApp.hook,
          fetch: proxyFetch
        }
      }
    : // Test Mode, for use with cdp-portal-stubs
      {
        headers: {
          authorization: 'test-value'
        },
        baseUrl
      }
)

export { octokit, graphql }
