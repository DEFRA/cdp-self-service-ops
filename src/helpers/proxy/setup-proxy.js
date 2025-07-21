import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { config } from '../../config/index.js'
import { bootstrap } from 'global-agent'

export function setupProxy() {
  const proxyUrl = config.get('httpProxy')

  if (proxyUrl) {
    // Undici proxy
    setGlobalDispatcher(new ProxyAgent(proxyUrl))

    // global-agent (axios/request/and others)
    bootstrap()
    global.GLOBAL_AGENT.HTTP_PROXY = proxyUrl
  }
}
