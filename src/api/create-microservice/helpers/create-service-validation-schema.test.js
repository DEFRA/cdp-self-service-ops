import { createServiceValidationSchema } from './create-service-validation-schema.js'

describe('#createServiceValidationSchema', () => {
  test('Should prevent creation of service name starting with a non-alphanumeric character', () => {
    const serviceTypeTemplate = 'cdp-node-backend-template'
    const repositoryName = '-test-service'
    const templateTag = 'main'
    const teamId = 'team'

    const serviceValidationSchema = createServiceValidationSchema([
      serviceTypeTemplate
    ])
    const validate = serviceValidationSchema.validate({
      serviceTypeTemplate,
      repositoryName,
      templateTag,
      teamId
    })
    expect(validate.error.message).toBe('Start and end with a letter or number')
  })

  test('Should prevent creation of service name ending with a non-alphanumeric character', () => {
    const serviceTypeTemplate = 'cdp-node-backend-template'
    const repositoryName = 'test-service-'
    const templateTag = 'main'
    const teamId = 'team'

    const serviceValidationSchema = createServiceValidationSchema([
      serviceTypeTemplate
    ])
    const validate = serviceValidationSchema.validate({
      serviceTypeTemplate,
      repositoryName,
      templateTag,
      teamId
    })
    expect(validate.error.message).toBe('Start and end with a letter or number')
  })

  test('Should prevent creation of service name containing non-alphanumeric or hyphen characters', () => {
    const serviceTypeTemplate = 'cdp-node-backend-template'
    const repositoryName = 'test_service'
    const templateTag = 'main'
    const teamId = 'team'

    const serviceValidationSchema = createServiceValidationSchema([
      serviceTypeTemplate
    ])
    const validate = serviceValidationSchema.validate({
      serviceTypeTemplate,
      repositoryName,
      templateTag,
      teamId
    })
    expect(validate.error.message).toBe(
      'Letters and numbers with hyphen separators'
    )
  })

  test('Should prevent creation of service name being longer than 32 characters', () => {
    const serviceTypeTemplate = 'cdp-node-backend-template'
    const repositoryName = 'test-service-abc-123-def-456-ghi-789-jkl'
    const templateTag = 'main'
    const teamId = 'team'

    const serviceValidationSchema = createServiceValidationSchema([
      serviceTypeTemplate
    ])
    const validate = serviceValidationSchema.validate({
      serviceTypeTemplate,
      repositoryName,
      templateTag,
      teamId
    })
    expect(validate.error.message).toBe('32 characters or less')
  })

  test('Should prevent creation of service ending in -ddl', () => {
    const serviceTypeTemplate = 'cdp-node-backend-template'
    const repositoryName = 'test-service-ddl'
    const templateTag = 'main'
    const teamId = 'team'

    const serviceValidationSchema = createServiceValidationSchema([
      serviceTypeTemplate
    ])
    const validate = serviceValidationSchema.validate({
      serviceTypeTemplate,
      repositoryName,
      templateTag,
      teamId
    })
    expect(validate.error.message).toBe('Must not end with "-ddl"')
  })
})
