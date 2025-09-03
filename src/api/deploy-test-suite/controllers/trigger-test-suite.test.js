import { randomUUID } from 'node:crypto'
import * as Hapi from '@hapi/hapi'
import { statusCodes } from '@defra/cdp-validation-kit'

import { config } from '../../../config/config.js'

const mockRunTestSuite = vi.fn()
vi.mock('../helpers/run-test-suite.js', () => ({
  runTestSuite: mockRunTestSuite
}))

describe('Test Trigger Test Suite', () => {
  /** @type {import('@hapi/hapi').Server} */
  let server

  beforeAll(async () => {
    config.set('portalBackendSharedSecret', 'mocked-secret')
    const { triggerTestSuiteController } = await import(
      './trigger-test-suite.js'
    )
    server = Hapi.server()
    server.route([
      {
        method: 'POST',
        path: '/trigger-test-suite',
        ...triggerTestSuiteController
      }
    ])
  })

  afterAll(async () => {
    if (server) {
      await server?.stop()
    }
  })

  const method = 'POST'
  const url = '/trigger-test-suite'
  const payload = {
    imageName: 'test-image',
    environment: 'infra-dev',
    cpu: 4096,
    memory: 8192,
    user: { id: randomUUID(), displayName: 'Test User' },
    deployment: {
      deploymentId: randomUUID(),
      service: 'test-image',
      version: '0.1.0'
    }
  }

  test('call to trigger-test-suite fails without signature headers', async () => {
    const { statusCode, payload: responsePayload } = await server.inject({
      method,
      payload,
      url
    })
    const { message } = JSON.parse(responsePayload)

    expect(statusCode).toBe(401)
    expect(message).toBe('Missing or invalid signature headers')
  })

  test('call to trigger-test-suite fails with an invalid signature', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const { statusCode, payload: responsePayload } = await server.inject({
      method,
      url,
      payload,
      headers: {
        'x-signature': 'invalid-signature',
        'x-timestamp': timestamp,
        'x-signature-version': 'v1',
        'content-type': 'application/json'
      }
    })
    const { message } = JSON.parse(responsePayload)

    expect(statusCode).toBe(401)
    expect(message).toBe('Invalid signature')
  })

  test('call to trigger-test-suite fails with an old timestamp', async () => {
    const timestamp300SecondsAgo = Math.floor(
      new Date(Date.now() - 300 * 1000) / 1000
    ).toString()
    const { statusCode, payload: responsePayload } = await server.inject({
      method,
      url,
      payload,
      headers: {
        'x-signature': 'invalid-signature',
        'x-timestamp': timestamp300SecondsAgo,
        'x-signature-version': 'v1',
        'content-type': 'application/json'
      }
    })
    const { message } = JSON.parse(responsePayload)

    expect(statusCode).toBe(401)
    expect(message).toBe('Invalid signature')
  })

  test('call to trigger-test-suite passes with a valid signature', async () => {
    const { generateSignature } = await import(
      '../../helpers/pre/validate-portal-backend-request.js'
    )

    const timestamp = Math.floor(Date.now() / 1000).toString()

    const validSignature = generateSignature(
      method,
      url,
      timestamp,
      JSON.stringify(payload),
      'mocked-secret'
    )

    mockRunTestSuite.mockResolvedValue('mocked-run-id')

    const { statusCode, payload: responsePayload } = await server.inject({
      method,
      url,
      payload,
      headers: {
        'x-signature': validSignature,
        'x-timestamp': timestamp,
        'x-signature-version': 'v1',
        'content-type': 'application/json'
      }
    })

    expect(responsePayload).toBe('{"runId":"mocked-run-id"}')

    expect(statusCode).toBe(statusCodes.ok)
  })
})
