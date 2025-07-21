import { describe, expect, test, vi } from 'vitest'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { removeDeployment } from '~/src/helpers/remove/workflows/remove-deployment.js'

vi.mock('~/src/helpers/github/trigger-workflow.js', () => ({
  triggerWorkflow: vi.fn()
}))

const logger = { info: vi.fn(), warn: vi.fn() }

describe('#removeDeployment', () => {
  test('should receive space separated list of all environments', async () => {
    const serviceName = 'my-service-name'

    triggerWorkflow.mockResolvedValueOnce({})

    await removeDeployment(serviceName, logger)

    expect(triggerWorkflow).toHaveBeenCalledWith(
      'DEFRA',
      'cdp-app-deployments',
      'remove-service.yml',
      {
        environments: 'infra-dev management dev test perf-test ext-test prod',
        service: serviceName
      },
      serviceName,
      logger
    )
  })
})
