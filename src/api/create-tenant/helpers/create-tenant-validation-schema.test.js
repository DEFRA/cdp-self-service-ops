import { createTenantValidationSchema } from './create-tenant-validation-schema.js'

describe('#create-tenant-validation-schema', () => {
  test('validate the request', () => {
    const input = {
      repositoryName: 'reponame',
      serviceTypeTemplate: 'cdp-node-journey-test-suite-template',
      teamId: 'platform',
      templateTag: ''
    }

    const { error, value } = createTenantValidationSchema.validate(input)
    expect(error).toBeUndefined()
    expect(value).toEqual(input)
  })

  test('reject requests with invalid templates', () => {
    const input = {
      repositoryName: 'reponame',
      serviceTypeTemplate: 'invalid value',
      teamId: 'platform',
      templateTag: ''
    }

    const { error } = createTenantValidationSchema.validate(input)
    expect(error).not.toBeUndefined()
  })
})
