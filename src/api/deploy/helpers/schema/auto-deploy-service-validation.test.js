import { describe, expect, test } from 'vitest'
import { autoDeployServiceValidation } from '~/src/api/deploy/helpers/schema/auto-deploy-service-validation.js'

describe('#autoDeployServiceValidation', () => {
  test('Schema should pass validation without errors', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.0',
      instanceCount: 4,
      cpu: 1024,
      memory: 2048,
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(autoDeployServiceValidation.validate(payload)).toEqual({
      value: {
        imageName: 'cdp-portal-frontend',
        environment: 'infra-dev',
        version: '1.0.0',
        instanceCount: 4,
        cpu: 1024,
        memory: 2048,
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          displayName: 'Auto-deployed'
        },
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
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(
      autoDeployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain(
      '"environment" must be one of [infra-dev, management, dev, test, perf-test, ext-test]'
    )
  })

  test("Schema shouldn't allow prod environment", () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'prod',
      version: '1.0.0',
      instanceCount: 4,
      cpu: 1024,
      memory: 2048,
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(
      autoDeployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain(
      '"environment" must be one of [infra-dev, management, dev, test, perf-test, ext-test]'
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
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(
      autoDeployServiceValidation.validate(payload).error.details.at(0).message
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
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(
      autoDeployServiceValidation.validate(payload).error.details.at(0).message
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
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(
      autoDeployServiceValidation.validate(payload).error.details.at(0).message
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
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(
      autoDeployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain('"instanceCount" must be less than or equal to 10')
  })

  test('Schema should error when given an invalid user id', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.1',
      instanceCount: 999,
      cpu: 1024,
      memory: 2048,
      user: {
        id: '',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(
      autoDeployServiceValidation.validate(payload).error.details.at(0).message
    ).toContain('"user.id" is not allowed to be empty')
  })

  test('Schema should pass validation without errors when provide with zero instance value', () => {
    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'infra-dev',
      version: '1.0.1',
      instanceCount: 0,
      cpu: 1024,
      memory: 2048,
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Auto-deployed'
      },
      configVersion: 'abc123def'
    }

    expect(autoDeployServiceValidation.validate(payload)).toEqual({
      value: {
        cpu: 1024,
        imageName: 'cdp-portal-frontend',
        environment: 'infra-dev',
        instanceCount: 0,
        memory: 2048,
        version: '1.0.1',
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          displayName: 'Auto-deployed'
        },
        configVersion: 'abc123def'
      }
    })
  })
})
