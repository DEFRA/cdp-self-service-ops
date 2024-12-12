import { findFeatureToggle } from '~/src/helpers/feature-toggle/find-feature-toggle.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'

jest.mock('~/src/helpers/feature-toggle/find-feature-toggle', () => {
  return {
    findFeatureToggle: jest.fn()
  }
})

describe('#isFeatureEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should be false if toggle is false', async () => {
    findFeatureToggle.mockReturnValue(false)
    const result = await isFeatureEnabled('some-feature')
    expect(result).toBe(false)
  })

  test('Should be true if toggle is true', async () => {
    findFeatureToggle.mockReturnValue(true)
    const result = await isFeatureEnabled('some-feature')
    expect(result).toBe(true)
  })

  test('Should be false if toggle is undefined', async () => {
    findFeatureToggle.mockReturnValue(undefined)
    const result = await isFeatureEnabled('some-feature')
    expect(result).toBe(false)
  })

  test('Should be true if toggle in enabled', async () => {
    findFeatureToggle.mockReturnValue({ enabled: true })
    const result = await isFeatureEnabled('some-feature')
    expect(result).toBe(true)
  })

  test('Should be false if toggle in disabled', async () => {
    findFeatureToggle.mockReturnValue({ enabled: false })
    const result = await isFeatureEnabled('some-feature')
    expect(result).toBe(false)
  })
})
