import { config } from '~/src/config/index.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { createMicroservice } from '~/src/helpers/create/create-microservice.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { updateLegacyStatus } from '~/src/helpers/portal-backend/legacy-status/update-legacy-status.js'
import { statuses } from '~/src/constants/statuses.js'
import { serviceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'

jest.mock('~/src/helpers/fetch-team', () => ({
  fetchTeam: jest.fn()
}))

jest.mock('~/src/helpers/github/trigger-workflow', () => ({
  triggerWorkflow: jest.fn()
}))

jest.mock(
  '~/src/helpers/portal-backend/legacy-status/create-legacy-status',
  () => ({
    createLegacyStatus: jest.fn()
  })
)

jest.mock(
  '~/src/helpers/portal-backend/legacy-status/update-legacy-status.js',
  () => ({
    updateLegacyStatus: jest.fn()
  })
)

jest.mock(
  '~/src/helpers/portal-backend/legacy-status/calculate-overall-status.js',
  () => ({
    calculateOverallStatus: jest.fn()
  })
)

const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
const service = `test-service-${new Date().toISOString()}`

describe('#create-test-runner-suite', () => {
  test('Should create microservice', async () => {
    fetchTeam.mockResolvedValue({
      team: {
        teamId: '123',
        name: 'test',
        github: 'test',
        serviceCodes: ['TST']
      }
    })

    await createMicroservice(
      logger,
      service,
      serviceTemplates['cdp-node-frontend-template'],
      'main',
      'team',
      { id: '123', displayName: 'test user' }
    )
    expect(triggerWorkflow).toHaveBeenCalledTimes(6)

    // Create repo
    const createRepoInputs = {
      serviceTypeTemplate: 'cdp-node-frontend-template',
      repositoryName: service,
      team: 'test',
      additionalGitHubTopics: 'cdp,service,node,frontend',
      templateTag: 'main'
    }
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.createWorkflows'),
      'create_microservice.yml',
      createRepoInputs,
      service,
      logger
    )

    expect(updateLegacyStatus).toHaveBeenCalledWith(
      service,
      config.get('github.repos.createWorkflows'),
      {
        status: statuses.requested,
        trigger: {
          org: config.get('github.org'),
          repo: config.get('github.repos.createWorkflows'),
          workflow: 'create_microservice.yml',
          inputs: createRepoInputs
        },
        result: 'ok'
      }
    )

    // Create infrastructure
    const infraInputs = {
      service,
      zone: 'public',
      mongo_enabled: 'false',
      redis_enabled: 'true',
      service_code: 'TST'
    }
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpTfSvcInfra'),
      config.get('workflows.createTenantService'),
      infraInputs,
      service,
      logger
    )

    expect(updateLegacyStatus).toHaveBeenCalledWith(
      service,
      config.get('github.repos.cdpTfSvcInfra'),
      {
        status: statuses.requested,
        trigger: {
          org: config.get('github.org'),
          repo: config.get('github.repos.cdpTfSvcInfra'),
          workflow: config.get('workflows.createTenantService'),
          inputs: infraInputs
        },
        result: 'ok'
      }
    )

    // Create App Config
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpAppConfig'),
      config.get('workflows.createAppConfig'),
      {
        service,
        team: 'test'
      },
      service,
      logger
    )

    expect(updateLegacyStatus).toHaveBeenCalledWith(
      service,
      config.get('github.repos.cdpAppConfig'),
      {
        status: statuses.requested,
        trigger: {
          org: config.get('github.org'),
          repo: config.get('github.repos.cdpAppConfig'),
          workflow: config.get('workflows.createAppConfig'),
          inputs: {
            service,
            team: 'test'
          }
        },
        result: 'ok'
      }
    )

    // Create Nginx
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpNginxUpstreams'),
      config.get('workflows.createNginxUpstreams'),
      {
        service,
        zone: 'public'
      },
      service,
      logger
    )

    expect(updateLegacyStatus).toHaveBeenCalledWith(
      service,
      config.get('github.repos.cdpNginxUpstreams'),
      {
        status: statuses.requested,
        trigger: {
          org: config.get('github.org'),
          repo: config.get('github.repos.cdpNginxUpstreams'),
          workflow: config.get('workflows.createNginxUpstreams'),
          inputs: {
            service,
            zone: 'public'
          }
        },
        result: 'ok'
      }
    )

    // Create Squid
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpSquidProxy'),
      config.get('workflows.createSquidConfig'),
      {
        service
      },
      service,
      logger
    )

    expect(updateLegacyStatus).toHaveBeenCalledWith(
      service,
      config.get('github.repos.cdpSquidProxy'),
      {
        status: statuses.requested,
        trigger: {
          org: config.get('github.org'),
          repo: config.get('github.repos.cdpSquidProxy'),
          workflow: config.get('workflows.createSquidConfig'),
          inputs: {
            service
          }
        },
        result: 'ok'
      }
    )

    // Create Dashboard
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpGrafanaSvc'),
      config.get('workflows.createDashboard'),
      {
        service,
        service_zone: 'public'
      },
      service,
      logger
    )

    expect(updateLegacyStatus).toHaveBeenCalledWith(
      service,
      config.get('github.repos.cdpGrafanaSvc'),
      {
        status: statuses.requested,
        trigger: {
          org: config.get('github.org'),
          repo: config.get('github.repos.cdpGrafanaSvc'),
          workflow: config.get('workflows.createDashboard'),
          inputs: {
            service,
            service_zone: 'public'
          }
        },
        result: 'ok'
      }
    )
  })
})
