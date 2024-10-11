import { deployWebShellValidation } from '~/src/api/deploy-webshell/helpers/deploy-webshell-validation'

describe('#deployWebShellValidation', () => {
  test('should pass a valid payload', () => {
    const res = deployWebShellValidation().validate({
      service: 'foo',
      environment: 'test'
    })
    expect(res.error).toBeUndefined()
  })

  test('should reject an invalid environment', () => {
    const res = deployWebShellValidation().validate({
      service: 'foo',
      environment: 'test-incorrect'
    })
    expect(res.error).not.toBeUndefined()
  })
})
