import { deployServicePayloadSchema } from './deploy-service-payload-validation'
import Joi from 'joi'

describe('deploy-service-payload', () => {
  const schema = deployServicePayloadSchema()

  test('payload only accepts valid looking versions', () => {
    const payload = { imageName: 'foo', version: 'v1.0.0' }
    expect(Joi.assert(payload, schema)).toBeUndefined()
  })

  test('payload fails on invalid versions', () => {
    const payload = { imageName: 'foo', version: 'latest' }
    expect(schema.validate(payload).error).not.toBeUndefined()
  })
})
