import { calculateOverallStatus } from '~/src/api/createV2/helpers/save-status'

describe('#calculateOverallStatus', () => {
  test('success status', () => {
    const result = calculateOverallStatus({
      createRepository: { status: 'success' },
      'tf-svc-infra': { status: 'success' },
      'cdp-app-config': { status: 'success' },
      'cdp-nginx-upstreams': { status: 'success' }
    })

    expect(result).toBe('success')
  })

  test('failure status', () => {
    const result = calculateOverallStatus({
      createRepository: { status: 'success' },
      'tf-svc-infra': { status: 'success' },
      'cdp-app-config': { status: 'failure' },
      'cdp-nginx-upstreams': { status: 'success' }
    })

    expect(result).toBe('failure')
  })

  test('inprogress', () => {
    const result = calculateOverallStatus({
      createRepository: { status: 'success' },
      'tf-svc-infra': { status: 'success' },
      'cdp-app-config': { status: 'some-weird-setting' },
      'cdp-nginx-upstreams': { status: 'in-progress' }
    })

    expect(result).toBe('in-progress')
  })
})
