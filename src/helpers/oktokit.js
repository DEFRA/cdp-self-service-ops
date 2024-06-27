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
      appId: config.get('gitHubAppId'),
      privateKey: Buffer.from(config.get('gitHubAppPrivateKey'), 'base64'),
      installationId: config.get('gitHubAppInstallationId')
    },
    request: { fetch: proxyFetch }
  }

  // Test Mode, for use with cdp-portal-stubs
  if (config.get('gitHubBaseUrl') != null) {
    cfg = {
      auth: 'test-value',
      baseUrl: config.get('gitHubBaseUrl')
    }
  }

  return new OctokitExtra(cfg)
}

const octokit = init()

export { octokit }
