import { generateWebShellToken } from '~/src/api/deploy-webshell/helpers/generate-webshell-token.js'

describe('#generate-webshell-token', () => {
  test('should generate unique tokens', () => {
    expect(generateWebShellToken(10)).not.toBe(generateWebShellToken(10))
  })

  test('should generate a token of a given length', () => {
    expect(generateWebShellToken(32)).toHaveLength(32)
  })
})
