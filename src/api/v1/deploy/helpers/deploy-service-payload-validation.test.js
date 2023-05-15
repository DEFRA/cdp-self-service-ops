import { deployServicePayloadSchema } from './deploy-service-payload-validation'
import Joi from 'joi'

describe('deploy-service-payload', () => {
  const schema = deployServicePayloadSchema()

  test('payload only accepts valid looking versions', () => {
    const payload = { image: 'foo', version: 'v1.0.0', cluster: 'frontend' }
    expect(Joi.assert(payload, schema)).toBeUndefined()
  })

  test('payload fails on invalid versions', () => {
    const payload = { image: 'foo', version: 'latest', cluster: 'frontend' }
    expect(schema.validate(payload).error).not.toBeUndefined()
  })

  test('payload only accepts valid clusters', () => {
    expect(
      Joi.assert(
        { image: 'foo', version: 'v1.0.0', cluster: 'frontend' },
        schema
      )
    ).toBeUndefined()
    expect(
      Joi.assert(
        { image: 'foo', version: 'v1.0.0', cluster: 'backend' },
        schema
      )
    ).toBeUndefined()
  })

  test('payload fails on invalid cluster', () => {
    const payload = { image: 'foo', version: 'latest', cluster: 'somewhere' }
    expect(schema.validate(payload).error).not.toBeUndefined()
  })
})
