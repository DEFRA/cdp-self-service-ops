import { ProxyAgent, fetch as undiciFetch } from 'undici'

import { config } from '#config/config.js'

const nonProxyFetch = (url, opts) => {
  return undiciFetch(url, {
    ...opts
  })
}

//todo see if you can remove this
const proxyFetch = (url, opts) => {
  const proxy = config.get('httpProxy')
  if (!proxy) {
    return nonProxyFetch(url, opts)
  } else {
    return undiciFetch(url, {
      ...opts,
      dispatcher: new ProxyAgent({
        uri: proxy,
        keepAliveTimeout: 10,
        keepAliveMaxTimeout: 10
      })
    })
  }
}

export { proxyFetch }
