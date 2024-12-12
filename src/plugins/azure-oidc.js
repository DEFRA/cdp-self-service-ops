import fetch from 'node-fetch'

import jwt from '@hapi/jwt'
import { config } from '~/src/config/index.js'
import { proxyFetch } from '~/src/helpers/proxy/proxy-fetch.js'

const azureOidc = {
  plugin: {
    name: 'azure-oidc',
    register: async (server) => {
      await server.register(jwt)

      const oidc = await proxyFetch(
        config.get('oidc.wellKnownConfigurationUrl')
      ).then((res) => res.json())

      server.auth.strategy('azure-oidc', 'jwt', {
        keys: {
          uri: oidc.jwks_uri
        },
        verify: {
          aud: config.get('oidc.audience'),
          iss: oidc.issuer,
          sub: false,
          nbf: true,
          exp: true,
          maxAgeSec: 5400, // 90 minutes
          timeSkewSec: 15
        },
        validate: async (artifacts) => {
          const payload = artifacts.decoded.payload

          const endpoint = config.get('userServiceBackendUrl') + `/scopes`

          const scopeResponse = await fetch(endpoint, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${artifacts.token}`
            }
          })

          const { scopes, scopeFlags } = await scopeResponse.json()

          return {
            isValid: true,
            credentials: {
              id: payload.oid,
              displayName: payload.name,
              email: payload.upn ?? payload.preferred_username,
              scope: scopes,
              scopeFlags
            }
          }
        }
      })
    }
  }
}

export { azureOidc }
