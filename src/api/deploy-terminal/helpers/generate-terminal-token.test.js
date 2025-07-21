import { describe, expect, test } from 'vitest'
import { generateTerminalToken } from '~/src/api/deploy-terminal/helpers/generate-terminal-token.js'

describe('#generate-terminal-token', () => {
  test('should generate unique tokens', () => {
    expect(generateTerminalToken(10)).not.toBe(generateTerminalToken(10))
  })

  test('should generate a token of a given length', () => {
    expect(generateTerminalToken(32)).toHaveLength(32)
  })
})
