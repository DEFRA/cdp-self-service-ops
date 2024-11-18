import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'

import { config } from '~/src/config'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { createPullRequest } from 'octokit-plugin-create-pull-request'
import { proxyFetch } from '~/src/helpers/proxy/proxy-fetch'

const OctokitExtra = Octokit.plugin(restEndpointMethods, createPullRequest)

const init = () => {
  let cfg = {
    authStrategy: createAppAuth,
    auth: {
      appId: config.get('github.app.id'),
      privateKey: Buffer.from(config.get('github.app.privateKey'), 'base64'),
      installationId: config.get('github.app.installationId')
    },
    request: { fetch: proxyFetch }
  }

  // Test Mode, for use with cdp-portal-stubs
  if (config.get('github.baseUrl') != null) {
    cfg = {
      auth: 'test-value',
      baseUrl: config.get('github.baseUrl')
    }
  }

  return new OctokitExtra(cfg)
}

const octokit = init()

export { octokit }
