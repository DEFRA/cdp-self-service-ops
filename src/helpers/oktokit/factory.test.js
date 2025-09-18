import { createAppAuth } from '@octokit/auth-app'
import { octokitFactory } from './factory.js'
import { proxyFetch } from '../proxy/proxy-fetch.js'

const buildConfig = (baseUrl) => ({
  ...(baseUrl && { baseUrl }),
  isStubbed: baseUrl !== undefined,
  app: {
    id: '123',
    privateKey: 'bW9jay1wcml2YXRlLWtleQ==', // base64 encoded 'mock-private-key' string
    installationId: '456'
  }
})

describe('#octokitFactory', () => {
  const mockGraphqlDefaults = vi.fn()
  const mockOctokitExtra = vi.fn().mockReturnValue({
    graphql: { defaults: mockGraphqlDefaults },
    auth: { hook: 'mockAuthHook' }
  })
  const stubBaseUrl = 'http://cdp.127.0.0.1.sslip.io:3333'

  describe('When stubbed', () => {
    beforeEach(() => {
      octokitFactory(mockOctokitExtra, buildConfig(stubBaseUrl))
    })

    test('Should call OctokitExtra for a stubbed octokit instance', () => {
      expect(mockOctokitExtra).toHaveBeenCalledWith({
        authStrategy: createAppAuth,
        auth: {
          appId: '123',
          privateKey: 'mock-private-key',
          installationId: '456'
        },
        request: {
          fetch: proxyFetch,
          baseUrl: stubBaseUrl
        },
        baseUrl: stubBaseUrl
      })
    })

    test('Should call OctokitExtra for a stubbed graphql instance', () => {
      expect(mockGraphqlDefaults).toHaveBeenCalledWith({
        request: {
          hook: 'mockAuthHook',
          fetch: proxyFetch
        },
        baseUrl: stubBaseUrl
      })
    })
  })

  describe('When not stubbed', () => {
    beforeEach(() => {
      octokitFactory(mockOctokitExtra, buildConfig())
    })

    test('Should call OctokitExtra for a non stubbed octokit instance', () => {
      expect(mockOctokitExtra).toHaveBeenCalledWith({
        authStrategy: createAppAuth,
        auth: {
          appId: '123',
          privateKey: 'mock-private-key',
          installationId: '456'
        },
        request: {
          fetch: proxyFetch
        }
      })
    })

    test('Octokit extra options should not include baseUrl', () => {
      expect(mockOctokitExtra.mock.calls[0][0]).not.toHaveProperty('baseUrl')
      expect(mockOctokitExtra.mock.calls[0][0].request).not.toHaveProperty(
        'baseUrl'
      )
    })

    test('Should call OctokitExtra for a non stubbed graphql instance', () => {
      expect(mockGraphqlDefaults).toHaveBeenCalledWith({
        request: {
          hook: 'mockAuthHook',
          fetch: proxyFetch
        }
      })
    })

    test('Octokit graphql defaults should not include baseUrl', () => {
      expect(mockGraphqlDefaults.mock.calls[0][0]).not.toHaveProperty('baseUrl')
    })
  })
})
