import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'

import { config } from '~/src/config'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { createPullRequest } from 'octokit-plugin-create-pull-request'

const OctokitExtra = Octokit.plugin(restEndpointMethods, createPullRequest)

const octokit = new OctokitExtra({
  authStrategy: createAppAuth,
  auth: {
    appId: config.get('gitHubAppId'),
    privateKey: Buffer.from(config.get('gitHubAppPrivateKey'), 'base64'),
    installationId: config.get('gitHubAppInstallationId')
  }
})

export { octokit }
