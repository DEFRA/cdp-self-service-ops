import { deployServicePayloadSchema } from '~/src/api/deploy/helpers/deploy-service-payload-validation'
import { ecsCpuAndMemorySizes } from '~/src/api/deploy/helpers/ecs-cpu-and-memory-settings'

describe('deploy-service-payload', () => {
  const schema = deployServicePayloadSchema()

  test('Schema should pass validation without errors', () => {
    const payload = {
      imageName: 'foo',
      version: 'v1.0.0',
      instances: 4,
      cpu: 1024,
      memory: 2048
    }

    expect(schema.validate(payload)).toEqual({
      value: {
        imageName: 'foo',
        version: 'v1.0.0',
        instances: 4,
        cpu: 1024,
        memory: 2048
      }
    })
  })

  test('Schema should fail validation with expected version error', () => {
    const payload = {
      imageName: 'foo',
      version: 'latest',
      instances: 4,
      cpu: 1024,
      memory: 2048
    }

    expect(schema.validate(payload).error.details.at(0).message).toContain(
      '"version" with value "latest" fails to match the required pattern'
    )
  })

  test('Schema should validate resource allocations without error', () => {
    const payload = {
      imageName: 'foo',
      version: 'v1.0.0',
      instances: 4,
      cpu: 1024,
      memory: 2048
    }

    expect(schema.validate(payload)).toEqual({
      value: {
        imageName: 'foo',
        version: 'v1.0.0',
        instances: 4,
        cpu: 1024,
        memory: 2048
      }
    })
  })

  test('Schema should when given an invalid cpu configuration', () => {
    const payload = {
      imageName: 'foo',
      version: '1.0.1',
      instances: 1,
      cpu: 1,
      memory: 1024
    }

    expect(schema.validate(payload).error.details.at(0).message).toContain(
      `"cpu" must be one of [${Object.keys(ecsCpuAndMemorySizes)
        .map((k) => Number.parseInt(k))
        .join(', ')}]`
    )
  })

  test('Schema should when given an invalid mem configuration', () => {
    const payload = {
      imageName: 'foo',
      version: '1.0.1',
      instances: 1,
      cpu: 1024,
      memory: 256
    }

    expect(schema.validate(payload).error.details.at(0).message).toContain(
      `"memory" must be one of [${ecsCpuAndMemorySizes['1024'].join(', ')}]`
    )
  })

  test('Schema should when given an invalid instance count configuration', () => {
    const payload = {
      imageName: 'foo',
      version: '1.0.1',
      instances: 999,
      cpu: 1024,
      memory: 2048
    }

    expect(schema.validate(payload).error.details.at(0).message).toContain(
      `"instances" must be less than or equal to 16`
    )
  })
})
