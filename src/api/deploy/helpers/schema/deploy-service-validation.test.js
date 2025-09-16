import { deployServiceValidation } from './deploy-service-validation.js'

describe('#deployServiceValidation', () => {
  test('Schema should pass validation without errors', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.0',
      instanceCount: 4,
      cpu: 1024,
      memory: 2048,
      configVersion: 'abc123def'
    }

    expect(deployServiceValidation.validate(payload)).toEqual({
      value: {
        imageName: 'cdp-portal-frontend',
        environment: 'infra-dev',
        version: '1.0.0',
        instanceCount: 4,
        cpu: 1024,
        memory: 2048,
        configVersion: 'abc123def'
      }
    })
  })

  test('Schema should fail validation with expected environment error', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'local',
      version: '1.0.0',
      instanceCount: 4,
      cpu: 1024,
      memory: 2048,
      configVersion: 'abc123def'
    }

    expect(
      deployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain(
      '"environment" must be one of [management, infra-dev, dev, test, perf-test, ext-test, prod]'
    )
  })

  test('Schema should fail validation with expected version error', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: 'latest',
      instanceCount: 4,
      cpu: 1024,
      memory: 2048,
      configVersion: 'abc123def'
    }

    expect(
      deployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain(
      '"version" with value "latest" fails to match the required pattern'
    )
  })

  test('Schema should provide expected error message when given an invalid cpu value', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.1',
      instanceCount: 1,
      cpu: 1,
      memory: 1024,
      configVersion: 'abc123def'
    }

    expect(
      deployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain('"cpu" must be one of [512, 1024, 2048, 4096, 8192]')
  })

  test('Schema should provide expected error message when given an invalid memory value', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.1',
      instanceCount: 1,
      cpu: 1024,
      memory: 256,
      configVersion: 'abc123def'
    }

    expect(
      deployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain(
      '"memory" must be one of [2048, 3072, 4096, 5120, 6144, 7168, 8192]'
    )
  })

  test('Schema should error when given an invalid instance count value', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.1',
      instanceCount: 999,
      cpu: 1024,
      memory: 2048,
      configVersion: 'abc123def'
    }

    expect(
      deployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain('"instanceCount" must be less than or equal to 10')
  })

  test('Schema should pass validation without errors when provide with zero instance value', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.1',
      instanceCount: 0,
      cpu: 1024,
      memory: 2048,
      configVersion: 'abc123def'
    }

    expect(deployServiceValidation.validate(payload)).toEqual({
      value: {
        cpu: 1024,
        imageName: 'cdp-portal-frontend',
        environment: 'infra-dev',
        instanceCount: 0,
        memory: 2048,
        version: '1.0.1',
        configVersion: 'abc123def'
      }
    })
  })
})
