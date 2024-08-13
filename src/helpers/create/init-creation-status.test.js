import { statuses } from '~/src/constants/statuses'
import { creations } from '~/src/constants/creations'
import {
  calculateOverallStatus,
  initCreationStatus
} from '~/src/helpers/create/init-creation-status'

describe('#initCreationStatus', () => {
  test('Should add whatever workflows are given as keys', async () => {
    const mockDb = {
      collection: () => ({
        insertOne: () => {}
      })
    }

    const result = await initCreationStatus(
      mockDb,
      'org',
      creations.microservice,
      'service-one',
      'cdp-node-frontend-template',
      'public',
      { teamId: '12345', name: 'cdp-platform' },
      { id: '555', displayName: 'user name' },
      ['cdp-create-workflows', 'cdp-app-config', 'cdp-tf-svc-infra']
    )

    expect(result).toEqual({
      org: 'org',
      repositoryName: 'service-one',
      portalVersion: 2,
      kind: creations.microservice,
      status: statuses.inProgress,
      started: expect.any(Date),
      serviceTypeTemplate: 'cdp-node-frontend-template',
      team: {
        teamId: '12345',
        name: 'cdp-platform'
      },
      creator: { id: '555', displayName: 'user name' },
      zone: 'public',
      'cdp-create-workflows': {
        status: statuses.notRequested
      },
      'cdp-app-config': {
        status: statuses.notRequested
      },
      'cdp-tf-svc-infra': {
        status: statuses.notRequested
      }
    })
  })
})

describe('#calculateOverallStatus', () => {
  describe('When calculating a microservice status', () => {
    test('Should provide a "Success" status', () => {
      const result = calculateOverallStatus({
        kind: creations.microservice,
        'cdp-create-workflows': { status: statuses.success },
        'cdp-tf-svc-infra': { status: statuses.success },
        'cdp-app-config': { status: statuses.success },
        'cdp-nginx-upstreams': { status: statuses.success },
        'cdp-squid-proxy': { status: statuses.success },
        'cdp-grafana-svc': { status: statuses.success }
      })

      expect(result).toBe(statuses.success)
    })

    test('Should provide a "Failure" status', () => {
      const result = calculateOverallStatus({
        kind: creations.microservice,
        'cdp-create-workflows': { status: statuses.success },
        'cdp-tf-svc-infra': { status: statuses.success },
        'cdp-app-config': { status: statuses.failure },
        'cdp-nginx-upstreams': { status: statuses.success },
        'cdp-squid-proxy': { status: statuses.success },
        'cdp-grafana-svc': { status: statuses.success }
      })

      expect(result).toBe(statuses.failure)
    })

    test('Should provide an "In Progress" status', () => {
      const result = calculateOverallStatus({
        kind: creations.microservice,
        'cdp-create-workflows': { status: statuses.success },
        'cdp-tf-svc-infra': { status: statuses.success },
        'cdp-app-config': { status: 'some-weird-setting' },
        'cdp-nginx-upstreams': { status: statuses.inProgress },
        'cdp-squid-proxy': { status: statuses.success },
        'cdp-grafana-svc': { status: statuses.success }
      })

      expect(result).toBe(statuses.inProgress)
    })
  })

  describe('When calculating a repository status', () => {
    test('Should provide a "Success" status', () => {
      const result = calculateOverallStatus({
        kind: creations.repository,
        'cdp-create-workflows': { status: statuses.success }
      })

      expect(result).toBe(statuses.success)
    })

    test('Should provide a "Failure" status', () => {
      const result = calculateOverallStatus({
        kind: creations.repository,
        'cdp-create-workflows': { status: statuses.failure }
      })

      expect(result).toBe(statuses.failure)
    })

    test('Should provide an "In Progress" status', () => {
      const result = calculateOverallStatus({
        kind: creations.repository,
        'cdp-create-workflows': { status: 'some-weird-setting' }
      })

      expect(result).toBe(statuses.inProgress)
    })
  })
})
