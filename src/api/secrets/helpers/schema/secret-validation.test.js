import { describe, expect, test, vi } from 'vitest'
import Joi from 'joi'

import { config } from '~/src/config/config.js'
import {
  secretParamsValidation,
  secretPayloadValidation
} from '~/src/api/secrets/helpers/schema/secret-validation.js'

describe('#secretParamsValidation', () => {
  test('Should validate a service name and environment', () => {
    const params = { serviceName: 'service1', environment: 'management' }
    const { error } = secretParamsValidation().validate(params)
    expect(error).toBeUndefined()
  })

  test('Should throw error for invalid tenant environment', () => {
    const params = { serviceName: 'service1', environment: 'foo' }
    const { error } = secretParamsValidation().validate(params)
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toBe(
      '"environment" must be one of [management, infra-dev, dev, test, perf-test, ext-test, prod]'
    )
  })

  test('Should throw an error if service name is empty', () => {
    const params = { serviceName: '', environment: 'dev' }
    const { error } = secretParamsValidation().validate(params)
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toBe('Enter repository name')
  })
})

describe('#secretPayloadValidation', () => {
  test('Should validate payload with correct data', () => {
    const payload = {
      secretKey: 'validSecretKey1',
      secretValue: 'validSecretValue'
    }
    config.get = vi.fn().mockReturnValue([])

    const { error } = secretPayloadValidation().validate(payload)
    expect(error).toBeUndefined()
  })

  test('Should provide an error for an immutable secretKey', () => {
    const payload = {
      secretKey: 'IMMUTABLE_KEY',
      secretValue: 'validSecretValue'
    }
    config.get = vi.fn().mockReturnValue(['IMMUTABLE_KEY'])
    const response = secretPayloadValidation().validate(payload)

    const error = response.error
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toBe('"secretKey" contains an invalid value')
  })

  test('Should provide an error for invalid secretKey', () => {
    const payload = {
      secretKey: 'invalid secret key!',
      secretValue: 'validSecretValue'
    }
    config.get = vi.fn().mockReturnValue([])

    const { error } = secretPayloadValidation().validate(payload)
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toBe(
      '"secretKey" with value "invalid secret key!" fails to match the required pattern: /^\\w*$/'
    )
  })

  test('Should provide error for invalid secretValue', () => {
    const payload = {
      secretKey: 'validSecretKey1',
      secretValue: 'invalid secret value!'
    }
    config.get = vi.fn().mockReturnValue([])

    const { error } = secretPayloadValidation().validate(payload)
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toBe(
      '"secretValue" with value "invalid secret value!" fails to match the required pattern: /^\\S*$/'
    )
  })
})
