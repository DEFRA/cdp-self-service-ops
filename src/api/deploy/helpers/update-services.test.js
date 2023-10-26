import { updateServices } from '~/src/api/deploy/helpers/update-services'

const testData = () => {
  return [
    {
      container_image: 'service-a',
      container_port: 8085,
      container_version: '0.1.0',
      desired_count: 1,
      env_files: [],
      env_vars: {},
      healthcheck: '/health',
      name: 'cdp-deployments',
      secrets: {},
      task_cpu: 1024,
      task_memory: 2048
    },
    {
      container_image: 'service-b',
      container_port: 8085,
      container_version: '1.2.0',
      desired_count: 1,
      env_files: [],
      env_vars: {},
      healthcheck: '/healthz',
      name: 'cdp-portal-deployables-backend',
      secrets: {},
      task_cpu: 1024,
      task_memory: 8192
    }
  ]
}

describe('update-services', () => {
  test('Version number should be updated when its different to the current one', () => {
    const services = testData()
    const result = JSON.parse(
      updateServices(services, 'service-a', '0.2.0', 1, 1024, 2048, 'dev')
    )

    expect(result[1]).toEqual(services[1])
    expect(result[0].container_image).toEqual('service-a')
    expect(result[0].container_version).toEqual('0.2.0')
  })

  test('Service-a is redeployed when the no new version number is supplied', () => {
    const services = testData()
    const result = JSON.parse(
      updateServices(services, 'service-a', '0.1.0', 1, 1024, 2048, 'dev')
    )

    expect(result[1]).toEqual(services[1])
    expect(result[0].container_version).toEqual('0.1.0')
    expect(Object.keys(result[0].env_vars)).toEqual(['CDP_REDEPLOY'])
  })

  test('service resources can be updated', () => {
    const services = testData()
    const result = JSON.parse(
      updateServices(services, 'service-b', '1.2.0', 4, 2048, 4096, 'dev')
    )

    expect(result[0]).toEqual(services[0])
    expect(result[1].container_version).toEqual('1.2.0')
    expect(result[1].desired_count).toEqual(4)
    expect(result[1].task_cpu).toEqual(2048)
    expect(result[1].task_memory).toEqual(4096)
  })

  test('new service is added to list if it doesnt exist', () => {
    const services = []
    const result = JSON.parse(
      updateServices(services, 'service-b', '1.2.0', 4, 2048, 4096, 'dev')
    )

    expect(result.length).toEqual(1)
    expect(result[0].container_image).toEqual('service-b')
  })
})
