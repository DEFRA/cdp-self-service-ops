import { Octokit } from '@octokit/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { createPullRequest } from 'octokit-plugin-create-pull-request'

import { config } from '~/src/config/index.js'
import { octokitFactory } from '~/src/helpers/oktokit/factory.js'

const OctokitExtra = Octokit.plugin(restEndpointMethods, createPullRequest)
const githubConfig = config.get('github')

const { octokit, graphql } = octokitFactory(OctokitExtra, githubConfig)

export { octokit, graphql }
