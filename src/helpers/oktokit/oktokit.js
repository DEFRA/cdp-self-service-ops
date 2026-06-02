import { Octokit } from '@octokit/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'

import { config } from '#config/config.js'
import { octokitFactory } from './factory.js'

const OctokitExtra = Octokit.plugin(restEndpointMethods)
const githubConfig = config.get('github')

const { octokit, graphql } = octokitFactory(OctokitExtra, githubConfig)

export { octokit, graphql }
