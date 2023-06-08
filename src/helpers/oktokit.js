import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'

import { appConfig } from '~/src/config'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { createPullRequest } from 'octokit-plugin-create-pull-request'

const OctokitExtra = Octokit.plugin(restEndpointMethods, createPullRequest)

const octokit = new OctokitExtra({
  authStrategy: createAppAuth,
  auth: {
    appId: appConfig.get('gitHubAppId'),
    privateKey: appConfig.get('gitHubAppPrivateKey'),
    installationId: appConfig.get('gitHubAppInstallationId')
  }
})

export { octokit }
