import { triggerWorkflow } from '../../github/trigger-workflow.js'
import { config } from '../../../config/index.js'
import { tenantTemplates } from '../../../api/create-tenant/helpers/templates.js'

vi.mock('../../oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

vi.mock('../../github/trigger-workflow.js')

describe('createTenant', () => {
  test('triggers workflow with expected parameters', async () => {
    const { triggerCreateTenantWorkflow } = await import(
      './trigger-create-tenant-workflow.js'
    )

    const request = {
      logger: { info: vi.fn() }
    }
    const name = 'test-service'
    const team = { teamId: 'foo-team', serviceCodes: ['FOO'] }
    const template = tenantTemplates['cdp-node-frontend-template']
    const org = config.get('github.org')
    const workflowRepo = config.get('github.repos.cdpTenantConfig')
    const workflowId = config.get('workflows.createTenantService')

    const tenantConfig = JSON.stringify({
      zone: 'public',
      mongo_enabled: template.mongo,
      redis_enabled: template.redis,
      type: template.entityType,
      subtype: template.entitySubType,
      team: team.teamId,
      service_code: team.serviceCodes[0]
    })

    await triggerCreateTenantWorkflow(request, name, team, template)
    expect(triggerWorkflow).toHaveBeenCalledWith(
      org,
      workflowRepo,
      workflowId,
      {
        service: name,
        template_repo: 'cdp-node-frontend-template@main',
        config: tenantConfig
      },
      name,
      expect.any(Object)
    )
  })
})
