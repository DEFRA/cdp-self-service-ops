import { serviceToSecretsMap } from '~/src/api/deploy/helpers/service-to-secrets-map'

describe('secrets for services', () => {
  test('redis keys get auto-added', () => {
    const secerts = serviceToSecretsMap['cdp-example-node-frontend']

    expect(secerts.dev).toEqual({
      SQUID_USERNAME: `cdp/services/cdp-example-node-frontend:SQUID_USERNAME`,
      SQUID_PASSWORD: `cdp/services/cdp-example-node-frontend:SQUID_PASSWORD`,
      REDIS_USERNAME: `cdp/services/cdp-example-node-frontend:REDIS_USERNAME`,
      REDIS_PASSWORD: `cdp/services/cdp-example-node-frontend:REDIS_PASSWORD`,
      REDIS_KEY_PREFIX: `cdp/services/cdp-example-node-frontend:REDIS_KEY_PREFIX`
    })

    expect(secerts.dev).toEqual(secerts.test)
    expect(secerts.dev).toEqual(secerts.prod)
  })
})
