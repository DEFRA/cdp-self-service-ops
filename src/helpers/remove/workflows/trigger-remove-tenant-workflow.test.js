vi.mock('../../oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

const triggerWorkflow = vi.fn()
vi.mock('../../github/trigger-workflow.js', () => ({ triggerWorkflow }))

const logger = { info: vi.fn(), warn: vi.fn() }

describe('#triggerRemoveTenantWorkflow', () => {
  test('should receive service name and type inputs', async () => {
    const { triggerRemoveTenantWorkflow } = await import(
      './trigger-remove-tenant-workflow.js'
    )

    const serviceName = 'my-service-name'
    const type = 'Microservice'

    triggerWorkflow.mockReturnValue({})

    await triggerRemoveTenantWorkflow(serviceName, type, logger)

    expect(triggerWorkflow).toHaveBeenCalledWith(
      'DEFRA',
      'cdp-tenant-config',
      'remove-service.yml',
      {
        service: serviceName,
        type
      },
      serviceName,
      logger
    )
  })
})
