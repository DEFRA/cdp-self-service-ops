import { removeEcsService } from '~/src/helpers/remove/workflows/remove-ecs-service.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

jest.mock('~/src/helpers/github/trigger-workflow')

const logger = { info: jest.fn(), warn: jest.fn() }

describe('#removeEcsService', () => {
  test('should receive space separated list of all environments', async () => {
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
