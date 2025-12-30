import { triggerWorkflow } from '../../github/trigger-workflow.js'
import { config } from '../../../config/index.js'
import { tenantTemplates } from '../../../api/create-tenant/helpers/templates.js'

vi.mock('../../oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

vi.mock('../../github/trigger-workflow.js')

describe('createTenant', () => {
  const org = config.get('github.org')
  const workflowRepo = config.get('github.repos.cdpTenantConfig')
  const workflowId = config.get('workflows.createTenantService')

  test('triggers workflow with expected parameters', async () => {
    const { triggerCreateTenantWorkflow } =
      await import('./trigger-create-tenant-workflow.js')

    const request = {
      logger: { info: vi.fn() }
    }
    const name = 'test-service'
    const team = {
      teamId: 'foo-team',
      github: 'foo-team-github',
      serviceCodes: ['FOO']
    }
    const template = tenantTemplates['cdp-node-frontend-template']

    await triggerCreateTenantWorkflow(request, name, team, template)

    const expectedTenantConfig = JSON.stringify({
      zone: 'public',
      mongo_enabled: template.mongo,
      redis_enabled: template.redis,
      type: template.entityType,
      subtype: template.entitySubType,
      team: team.teamId,
      github_team: team.github,
      service_code: team.serviceCodes[0]
    })

    expect(triggerWorkflow).toHaveBeenCalledWith(
      org,
      workflowRepo,
      workflowId,
      {
        service: name,
        template_repo: 'cdp-node-frontend-template@main',
        config: expectedTenantConfig
      },
      name,
      expect.any(Object)
    )
  })

  test('triggers workflow over-riding template tag', async () => {
    const { triggerCreateTenantWorkflow } =
      await import('./trigger-create-tenant-workflow.js')

    const request = {
      logger: { info: vi.fn() }
    }
    const name = 'test-service'
    const team = {
      teamId: 'foo-team',
      github: 'foo-team-github',
      serviceCodes: ['FOO']
    }
    const template = tenantTemplates['cdp-node-frontend-template']

    await triggerCreateTenantWorkflow(request, name, team, template, 'tag')

    const expectedTenantConfig = JSON.stringify({
      zone: 'public',
      mongo_enabled: template.mongo,
      redis_enabled: template.redis,
      type: template.entityType,
      subtype: template.entitySubType,
      team: team.teamId,
      github_team: team.github,
      service_code: team.serviceCodes[0]
    })

    expect(triggerWorkflow).toHaveBeenCalledWith(
      org,
      workflowRepo,
      workflowId,
      {
        service: name,
        template_repo: 'cdp-node-frontend-template@tag',
        config: expectedTenantConfig
      },
      name,
      expect.any(Object)
    )
  })

  test('uses default branch overrides', async () => {
    const { triggerCreateTenantWorkflow } =
      await import('./trigger-create-tenant-workflow.js')

    const request = {
      logger: { info: vi.fn() }
    }
    const name = 'test-service'
    const team = {
      teamId: 'foo-team',
      github: 'foo-team-github',
      serviceCodes: ['FOO']
    }
    const template = tenantTemplates['cdp-node-backend-template-minimal']

    await triggerCreateTenantWorkflow(request, name, team, template)

    const expectedTenantConfig = JSON.stringify({
      zone: 'protected',
      mongo_enabled: template.mongo,
      redis_enabled: template.redis,
      type: template.entityType,
      subtype: template.entitySubType,
      team: team.teamId,
      github_team: team.github,
      service_code: team.serviceCodes[0]
    })

    expect(triggerWorkflow).toHaveBeenCalledWith(
      org,
      workflowRepo,
      workflowId,
      {
        service: name,
        template_repo: `${template.repositoryName}@${template.defaultBranch}`,
        config: expectedTenantConfig
      },
      name,
      expect.any(Object)
    )
  })
})
