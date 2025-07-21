import { describe, expect, test, vi } from 'vitest'

vi.mock('../../oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

const triggerWorkflow = vi.fn()
vi.mock('../../github/trigger-workflow.js', () => ({ triggerWorkflow }))

const logger = { info: vi.fn(), warn: vi.fn() }

describe('#removeEcsService', () => {
  test('should receive space separated list of all environments', async () => {
    const { removeEcsService } = await import('./remove-ecs-service.js')

    const serviceName = 'my-service-name'

    triggerWorkflow.mockReturnValue({})

    await removeEcsService(serviceName, logger)

    expect(triggerWorkflow).toHaveBeenCalledWith(
      'DEFRA',
      'cdp-tf-svc-infra',
      'remove-ecs.yml',
      {
        environments: 'infra-dev management dev test perf-test ext-test prod',
        service: serviceName
      },
      serviceName,
      logger
    )
  })
})
