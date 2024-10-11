import Joi from 'joi'

import { config } from '~/src/config'
import {
  secretParamsValidation,
  secretPayloadValidation
} from '~/src/api/secrets/helpers/schema/secret-validation'

describe('#secretParamsValidation', () => {
  const adminTeamId = 'admin-team-id'
  const tenantTeam = 'non-admin-team-id'

  test('Should validate admin teamId with service in management', () => {
    const params = { serviceName: 'service1', environment: 'management' }
    const options = { context: { payload: { teamId: adminTeamId } } }
    config.get = jest.fn().mockReturnValue(adminTeamId)

    const validate = secretParamsValidation()
    expect(() => validate(params, options)).not.toThrow()
  })

  test('Should throw error for invalid tenant team deploying to infra-dev', () => {
    const params = { serviceName: 'service1', environment: 'management' }
    const options = { context: { payload: { teamId: tenantTeam } } }
    config.get = jest.fn().mockReturnValue(adminTeamId)

    const validate = secretParamsValidation()
    expect(() => validate(params, options)).toThrow(
      new Joi.ValidationError(
        '"environment" must be one of [dev, test, perf-test, ext-test, prod]'
      )
    )
  })

  test('Should validate tenant team with service in dev', () => {
    const params = { serviceName: 'service1', environment: 'dev' }
    const options = { context: { payload: { teamId: tenantTeam } } }
    config.get = jest.fn().mockReturnValue(adminTeamId)

    const validate = secretParamsValidation()
    expect(() => validate(params, options)).not.toThrow()
  })
})

describe('#secretPayloadValidation', () => {
  test('Should validate payload with correct data', () => {
    const payload = {
      secretKey: 'validSecretKey1',
      secretValue: 'validSecretValue',
      teamId: '123e4567-e89b-12d3-a456-426614174000'
    }
    config.get = jest.fn().mockReturnValue([])

    const { error } = secretPayloadValidation().validate(payload)
    expect(error).toBeUndefined()
  })

  test('Should provide an error for an immutable secretKey', () => {
    const payload = {
      secretKey: 'IMMUTABLE_KEY',
      secretValue: 'validSecretValue',
      teamId: '123e4567-e89b-12d3-a456-426614174000'
    }
    config.get = jest.fn().mockReturnValue(['IMMUTABLE_KEY'])
    const { error } = secretPayloadValidation().validate(payload)

    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toEqual('"secretKey" contains an invalid value')
  })

  test('Should provide an error for invalid secretKey', () => {
    const payload = {
      secretKey: 'invalid secret key!',
      secretValue: 'validSecretValue',
      teamId: '123e4567-e89b-12d3-a456-426614174000'
    }
    config.get = jest.fn().mockReturnValue([])

    const { error } = secretPayloadValidation().validate(payload)
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toEqual(
      '"secretKey" with value "invalid secret key!" fails to match the required pattern: /^\\w*$/'
    )
  })

  test('Should provide error for invalid secretValue', () => {
    const payload = {
      secretKey: 'validSecretKey1',
      secretValue: 'invalid secret value!',
      teamId: '123e4567-e89b-12d3-a456-426614174000'
    }
    config.get = jest.fn().mockReturnValue([])

    const { error } = secretPayloadValidation().validate(payload)
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toEqual(
      '"secretValue" with value "invalid secret value!" fails to match the required pattern: /^\\S*$/'
    )
  })

  test('Should provide error for an invalid teamId', () => {
    const payload = {
      secretKey: 'validSecretKey1',
      secretValue: 'validSecretValue',
      teamId: 'invalid-uuid'
    }
    config.get = jest.fn().mockReturnValue([])

    const { error } = secretPayloadValidation().validate(payload)
    expect(error).toBeInstanceOf(Joi.ValidationError)
    expect(error.message).toEqual('"teamId" must be a valid GUID')
  })
})
