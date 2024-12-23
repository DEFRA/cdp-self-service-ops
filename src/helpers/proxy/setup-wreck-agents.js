import Wreck from '@hapi/wreck'

import { createLogger } from '~/src/helpers/logging/logger.js'

/**
 * Provide Wreck http client agents
 * @param {object} proxy
 */
function setupWreckAgents(proxy) {
  if (proxy?.agent) {
    createLogger().info('Wreck agents setup')

    Wreck.agents = {
      https: proxy.agent,
      http: proxy.agent,
      httpsAllowUnauthorized: proxy.agent
    }
  }
}

export { setupWreckAgents }
