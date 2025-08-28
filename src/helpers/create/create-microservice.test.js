import { config } from '../../config/index.js'
import { fetchTeam } from '../fetch-team.js'
import { createMicroservice } from './create-microservice.js'
import { triggerWorkflow } from '../github/trigger-workflow.js'
import { microserviceTemplates } from '../../api/create-microservice/helpers/microservice-templates.js'
import { createEntity } from '../portal-backend/create-entity.js'
import { entitySubTypes, entityTypes } from '../../constants/entities.js'
import { randomUUID } from 'node:crypto'
import { vi } from 'vitest'

vi.mock('../fetch-team', () => ({
  fetchTeam: vi.fn()
}))

vi.mock('../github/trigger-workflow', () => ({
  triggerWorkflow: vi.fn()
}))

vi.mock('../portal-backend/create-entity.js', () => ({
  createEntity: vi.fn()
}))

const logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
const repositoryName = `test-service-${new Date().toISOString().replace(/\D/g, '')}`

describe('#create-test-runner-suite', () => {
  beforeAll(() => {
    vi.useFakeTimers({ advanceTimers: true })
    vi.setSystemTime(new Date('2025-05-10T14:16:00.000Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('Should create microservice', async () => {
    const teamId = randomUUID()
    fetchTeam.mockResolvedValue({
      teamId,
      name: 'test',
      github: 'test',
      serviceCodes: ['TST']
    })

    const userId = randomUUID()
    await createMicroservice({
      logger,
      repositoryName,
      template: microserviceTemplates['cdp-node-frontend-template'],
      templateTag: 'main',
      teamId,
      user: {
        id: userId,
        displayName: 'test user'
      }
    })
    expect(triggerWorkflow).toHaveBeenCalledTimes(6)

    expect(createEntity).toHaveBeenCalledWith({
      name: repositoryName,
      type: entityTypes.microservice,
      subType: entitySubTypes.frontend,
      created: new Date('2025-05-10T14:16:00.000Z'),
      creator: {
        id: userId,
        displayName: 'test user'
      },
      teams: [
        {
          teamId,
          name: 'test'
        }
      ],
      status: 'Creating',
      decommissioned: null
    })

    // Create repo
    const createRepoInputs = {
      serviceTypeTemplate: 'cdp-node-frontend-template',
      repositoryName,
      team: 'test',
      additionalGitHubTopics: 'cdp,service,node,frontend',
      templateTag: 'main'
    }
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.createWorkflows'),
      'create_microservice.yml',
      createRepoInputs,
      repositoryName,
      logger
    )

    // Create infrastructure
    const infraInputs = {
      service: repositoryName,
      zone: 'public',
      mongo_enabled: 'false',
      redis_enabled: 'true',
      service_code: 'TST',
      type: entityTypes.microservice,
      subtype: entitySubTypes.frontend,
      team: teamId
    }
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpTfSvcInfra'),
      config.get('workflows.createTenantService'),
      infraInputs,
      repositoryName,
      logger
    )

    // Create App Config
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpAppConfig'),
      config.get('workflows.createAppConfig'),
      {
        service: repositoryName,
        team: 'test'
      },
      repositoryName,
      logger
    )

    // Create Nginx
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpNginxUpstreams'),
      config.get('workflows.createNginxUpstreams'),
      {
        service: repositoryName,
        zone: 'public'
      },
      repositoryName,
      logger
    )

    // Create Squid
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpSquidProxy'),
      config.get('workflows.createSquidConfig'),
      {
        service: repositoryName
      },
      repositoryName,
      logger
    )

    // Create Dashboard
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpGrafanaSvc'),
      config.get('workflows.createDashboard'),
      {
        service: repositoryName,
        service_zone: 'public'
      },
      repositoryName,
      logger
    )
  })
})
