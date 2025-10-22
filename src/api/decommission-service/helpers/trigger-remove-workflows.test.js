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

describe('#triggerRemoveWorkflows', () => {
  const serviceName = 'some-service'
  const backendEntity = {
    Type: 'Microservice',
    SubType: 'Backend'
  }
  const frontendEntity = {
    Type: 'Microservice',
    SubType: 'Frontend'
  }
  const testEntity = {
    Type: 'TestSuite',
    SubType: 'Journey'
  }

  test('Should trigger relevant workflows when run for backend repo', async () => {
    const { triggerRemoveWorkflows } = await import(
      './trigger-remove-workflows.js'
    )

    await triggerRemoveWorkflows(serviceName, backendEntity, logger)

    expect(triggerRemoveTenantWorkflow).toHaveBeenCalledWith(
      serviceName,
      'Microservice',
      logger
    )
  })

  test('Should trigger relevant workflows when run for frontend repo', async () => {
    const { triggerRemoveWorkflows } = await import(
      './trigger-remove-workflows.js'
    )

    await triggerRemoveWorkflows(serviceName, frontendEntity, logger)

    expect(triggerRemoveTenantWorkflow).toHaveBeenCalledWith(
      serviceName,
      'Microservice',
      logger
    )
  })

  test('Should trigger relevant workflows when run for test suite', async () => {
    const { triggerRemoveWorkflows } = await import(
      './trigger-remove-workflows.js'
    )

    await triggerRemoveWorkflows(serviceName, testEntity, logger)

    expect(triggerRemoveTenantWorkflow).toHaveBeenCalledWith(
      serviceName,
      'TestSuite',
      logger
    )
  })
})
