import { createRemoteJWKSet, jwtVerify } from 'jose'
import { config } from '../config/index.js'
import { proxyFetch } from '../helpers/proxy/proxy-fetch.js'
import Boom from '@hapi/boom'

const azureOidc = {
  plugin: {
    name: 'azure-oidc',
    register: async (server) => {
      const oidc = await proxyFetch(
        config.get('oidc.wellKnownConfigurationUrl')
      ).then((res) => res.json())

      const JWKS = createRemoteJWKSet(new URL(oidc.jwks_uri))

      server.auth.scheme('azure-oidc-scheme', () => {
        return {
          authenticate: async (request, h) => {
            const auth = request.headers.authorization
            if (!auth || !auth.startsWith('Bearer ')) {
              throw Boom.unauthorized('Missing token')
            }

            const token = auth.replace('Bearer ', '')

            const { payload } = await jwtVerify(token, JWKS, {
              issuer: oidc.issuer,
              audience: config.get('oidc.audience')
            })

            const endpoint = config.get('userServiceBackendUrl') + `/scopes`

            const scopeResponse = await fetch(endpoint, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            })

            const { scopes, scopeFlags } = await scopeResponse.json()

            return h.authenticated({
              credentials: {
                id: payload.oid,
                displayName: payload.name,
                email: payload.upn ?? payload.preferred_username,
                scope: scopes,
                scopeFlags
              }
            })
          }
        }
      })

      server.auth.strategy('azure-oidc', 'azure-oidc-scheme')
    }
  }
}

export { azureOidc }
