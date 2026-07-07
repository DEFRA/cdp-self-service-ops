const get = vi.fn()

vi.mock('#config/config.js', () => ({
  config: { get }
}))

describe('#shouldUseShutterV2', () => {
  test('returns true when environment is enabled', async () => {
    get.mockReturnValue('infra-dev,test')
    const { shouldUseShutterV2 } = await import('./should-use-shutter-v2.js')

    expect(shouldUseShutterV2('infra-dev')).toBe(true)
  })

  test('returns false when environment is not enabled', async () => {
    get.mockReturnValue('infra-dev,test')
    const { shouldUseShutterV2 } = await import('./should-use-shutter-v2.js')

    expect(shouldUseShutterV2('prod')).toBe(false)
  })
})
