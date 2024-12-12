import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'

import { createPullRequest } from 'octokit-plugin-create-pull-request'
import { config } from '~/src/config/index.js'
import { proxyFetch } from '~/src/helpers/proxy/proxy-fetch.js'

const auth = {
  appId: config.get('github.app.id'),
  privateKey: Buffer.from(config.get('github.app.privateKey'), 'base64'),
  installationId: config.get('github.app.installationId')
}

const OctokitExtra = Octokit.plugin(restEndpointMethods, createPullRequest)
const baseUrl = config.get('github.baseUrl')

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
        baseUrl: config.get('github.baseUrl')
      }
)

export { octokit }
