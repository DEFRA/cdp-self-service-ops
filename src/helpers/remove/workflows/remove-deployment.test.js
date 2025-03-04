import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { removeDeployment } from '~/src/helpers/remove/workflows/remove-deployment.js'

jest.mock('~/src/helpers/github/trigger-workflow')

const logger = { info: jest.fn(), warn: jest.fn() }

describe('#removeDeployment', () => {
  test('should receive space separated list of all environments', async () => {
    const serviceName = 'my-service-name'

    triggerWorkflow.mockReturnValue({})

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
