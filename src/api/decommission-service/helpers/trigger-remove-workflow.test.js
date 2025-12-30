import { triggerRemoveTenantWorkflow } from '../../../helpers/remove/workflows/trigger-remove-tenant-workflow.js'

vi.mock('../../../helpers/oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn(),
  request: vi.fn()
}))

vi.mock('../../../helpers/remove/workflows/trigger-remove-tenant-workflow.js')

const logger = {
  info: vi.fn()
}

describe('#triggerRemoveWorkflow', () => {
  const serviceName = 'some-service'
  const backendEntity = {
    name: serviceName,
    type: 'Microservice',
    subType: 'Backend'
  }
  const frontendEntity = {
    name: serviceName,
    type: 'Microservice',
    subType: 'Frontend'
  }
  const testEntity = {
    name: serviceName,
    type: 'TestSuite',
    subType: 'Journey'
  }

  test('Should trigger relevant workflow when run for backend repo', async () => {
    const { triggerRemoveWorkflow } =
      await import('./trigger-remove-workflow.js')

    await triggerRemoveWorkflow(backendEntity, logger)

    expect(triggerRemoveTenantWorkflow).toHaveBeenCalledWith(
      serviceName,
      'Microservice',
      logger
    )
  })

  test('Should trigger relevant workflow when run for frontend repo', async () => {
    const { triggerRemoveWorkflow } =
      await import('./trigger-remove-workflow.js')

    await triggerRemoveWorkflow(frontendEntity, logger)

    expect(triggerRemoveTenantWorkflow).toHaveBeenCalledWith(
      serviceName,
      'Microservice',
      logger
    )
  })

  test('Should trigger relevant workflow when run for test suite', async () => {
    const { triggerRemoveWorkflow } =
      await import('./trigger-remove-workflow.js')

    await triggerRemoveWorkflow(testEntity, logger)

    expect(triggerRemoveTenantWorkflow).toHaveBeenCalledWith(
      serviceName,
      'TestSuite',
      logger
    )
  })
})
