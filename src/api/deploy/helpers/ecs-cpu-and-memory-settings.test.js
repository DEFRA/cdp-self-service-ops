import { ecsCpuAndMemorySizes } from '~/src/api/deploy/helpers/ecs-cpu-and-memory-settings'

describe('ecsCpuAndMemorySizes', () => {
  test('cpu of 8192 only allows memory in increments of 4gb', () => {
    expect(ecsCpuAndMemorySizes['8192']).toEqual([
      16384, 20480, 24576, 28672, 32768, 36864, 40960, 45056, 49152, 53248,
      57344, 61440
    ])
  })

  test('cpu of 256 doesnt support 512 as its not enough with both sidecars', () => {
    expect(ecsCpuAndMemorySizes['256']).toEqual([1024, 2048])
  })

  test('cpu values match those supported by ECS fargate', () => {
    expect(Object.keys(ecsCpuAndMemorySizes)).toEqual([
      '256',
      '512',
      '1024',
      '2048',
      '4096',
      '8192'
    ])
  })
})
