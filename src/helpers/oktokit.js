import { Octokit } from '@octokit/core'

import { appConfig } from '~/src/config'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { createPullRequest } from 'octokit-plugin-create-pull-request'

const OctokitExtra = Octokit.plugin(restEndpointMethods, createPullRequest)
const octokit = new OctokitExtra({ auth: appConfig.get('gitHubToken') })

export { octokit }
