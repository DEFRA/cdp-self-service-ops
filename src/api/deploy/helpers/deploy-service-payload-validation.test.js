import { deployServicePayloadSchema } from '~/src/api/deploy/helpers/deploy-service-payload-validation'

describe('deploy-service-payload', () => {
  const schema = deployServicePayloadSchema()

  test('Schema should pass validation without errors', () => {
    const payload = { imageName: 'foo', version: 'v1.0.0' }

    expect(schema.validate(payload)).toEqual({
      value: {
        imageName: 'foo',
        version: 'v1.0.0'
      }
    })
  })

  test('Schema should fail validation with expected version error', () => {
    const payload = { imageName: 'foo', version: 'latest' }

    expect(schema.validate(payload).error.details.at(0).message).toContain(
      '"version" with value "latest" fails to match the required pattern'
    )
  })
})
