import crypto from 'crypto'

export function generateWebShellToken(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}
