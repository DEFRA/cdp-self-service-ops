import { calculateOverallStatus } from '~/src/api/createV2/helpers/save-status'
import { statuses } from '~/src/constants/statuses'

describe('#calculateOverallStatus', () => {
  test('success status', () => {
    const result = calculateOverallStatus({
      createRepository: { status: statuses.success },
      'cdp-tf-svc-infra': { status: statuses.success },
      'cdp-app-config': { status: statuses.success },
      'cdp-nginx-upstreams': { status: statuses.success }
    })

    expect(result).toBe(statuses.success)
  })

  test('failure status', () => {
    const result = calculateOverallStatus({
      createRepository: { status: statuses.success },
      'cdp-tf-svc-infra': { status: statuses.success },
      'cdp-app-config': { status: statuses.failure },
      'cdp-nginx-upstreams': { status: statuses.success }
    })

    expect(result).toBe(statuses.failure)
  })

  test('Should provide status as "In Progress"', () => {
    const result = calculateOverallStatus({
      createRepository: { status: statuses.success },
      'cdp-tf-svc-infra': { status: statuses.success },
      'cdp-app-config': { status: 'some-weird-setting' },
      'cdp-nginx-upstreams': { status: statuses.inProgress }
    })

    expect(result).toBe(statuses.inProgress)
  })
})
