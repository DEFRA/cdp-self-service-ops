import { createAppAuth } from '@octokit/auth-app'

import { removeNil } from '~/src/helpers/remove-nill.js'
import { proxyFetch } from '~/src/helpers/proxy/proxy-fetch.js'

/**
 * @typedef {object} GitHubConfig
 * @property {string|null} baseUrl
 * @property {object} app
 * @property {string} app.id
 * @property {string} app.privateKey
 * @property {string} app.installationId
 */

/**
 * @typedef {import('@octokit/core').Octokit} Octokit
 * @typedef {import('@octokit/core').Constructor} Constructor
 * @typedef {import('@octokit/graphql').graphql} graphql
 */

/**
 * Builds the Octokit and graphql instances to be used across the app
 * @param {Octokit & Constructor} OctokitExtra
 * @param {GitHubConfig} gitHubConfig
 * @returns {{octokit: Octokit, graphql: graphql}}
 */
function octokitFactory(OctokitExtra, gitHubConfig) {
  const baseUrl = gitHubConfig.baseUrl
  const auth = {
    appId: gitHubConfig.app.id,
    privateKey: Buffer.from(gitHubConfig.app.privateKey, 'base64').toString(
      'utf8'
    ),
    installationId: gitHubConfig.app.installationId
  }

  const octokit = new OctokitExtra(
    removeNil({
      authStrategy: createAppAuth,
      auth,
      request: { fetch: proxyFetch, baseUrl },
      baseUrl
    })
  )

  const graphql = octokit.graphql.defaults(
    removeNil({
      request: {
        hook: octokit.auth.hook,
        fetch: proxyFetch
      },
      baseUrl
    })
  )

  return { octokit, graphql }
}

export { octokitFactory }
