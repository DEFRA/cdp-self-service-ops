import { describe, expect, test } from 'vitest'
import { deployTerminalValidation } from './deploy-terminal-validation.js'

describe('#deployTerminalValidation', () => {
  test('should pass a valid payload', () => {
    const res = deployTerminalValidation().validate({
      service: 'foo',
      environment: 'test'
    })
    expect(res.error).toBeUndefined()
  })

  test('should reject an invalid environment', () => {
    const res = deployTerminalValidation().validate({
      service: 'foo',
      environment: 'test-incorrect'
    })
    expect(res.error).toBeDefined()
  })
})
