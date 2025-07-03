import { config } from '~/src/config/index.js'
import Boom from '@hapi/boom'
import crypto from 'crypto'

const SHARED_SECRET = config.get('portalBackendSharedSecret')

function generateSignature(method, path, timestamp, body, secret) {
  const message = `${method}\n${path}\n${timestamp}\n${body}`
  return crypto.createHmac('sha256', secret).update(message).digest('hex')
}

function isTimestampFresh(timestamp, windowSeconds = 300) {
  const now = Math.floor(Date.now() / 1000)
  const diff = Math.abs(now - parseInt(timestamp, 10))
  return diff <= windowSeconds
}

export const validatePortalBackendRequest = {
  method: (request, h) => {
    const sig = request.headers['x-signature']
    const timestamp = request.headers['x-timestamp']
    const version = request.headers['x-signature-version']

    if (!sig || !timestamp || version !== 'v1') {
      throw Boom.unauthorized('Missing or invalid signature headers')
    }

    if (!isTimestampFresh(timestamp)) {
      throw Boom.unauthorized('Timestamp is too old')
    }

    const method = request.method.toUpperCase()
    const path = request.path
    const body = ''

    const expected = generateSignature(
      method,
      path,
      timestamp,
      body,
      SHARED_SECRET
    )

    if (expected.toUpperCase() !== sig.toUpperCase()) {
      throw Boom.unauthorized('Invalid signature')
    }

    return h.continue
  }
}
