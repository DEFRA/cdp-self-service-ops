import { MongoClient } from 'mongodb'

import { config } from '~/src/config/index.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { createMicroservice } from '~/src/helpers/create/create-microservice.js'
import { statuses } from '~/src/constants/statuses.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

jest.mock('~/src/helpers/fetch-team', () => ({
  fetchTeam: jest.fn()
}))

jest.mock('~/src/helpers/github/trigger-workflow', () => ({
  triggerWorkflow: jest.fn()
}))

const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
let connection
let db
const service = `test-service-${new Date().toISOString()}`

beforeEach(async () => {
  await db.collection('status').deleteMany({ repositoryName: service })
})

beforeAll(async () => {
  connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  db = connection.db(globalThis.__MONGO_DB_NAME__)
})

afterAll(async () => {
  await connection.close()
})

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

    const request = {
      db,
      logger
    }

    await createMicroservice(
      request,
      service,
      'cdp-node-frontend-template',
      'main',
      'public',
      'team',
      { id: '123', displayName: 'test user' }
    )
    expect(triggerWorkflow).toHaveBeenCalledTimes(6)

    // Create repo
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.createWorkflows'),
      'create_microservice.yml',
      {
        serviceTypeTemplate: 'cdp-node-frontend-template',
        repositoryName: service,
        team: 'test',
        additionalGitHubTopics: 'cdp,service,node,frontend',
        templateTag: 'main'
      },
      service,
      request.logger
    )

    // Create infrastructure
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpTfSvcInfra'),
      config.get('workflows.createTenantService'),
      {
        service,
        zone: 'public',
        mongo_enabled: 'false',
        redis_enabled: 'true',
        service_code: 'TST'
      },
      service,
      request.logger
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
      request.logger
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
      request.logger
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
      request.logger
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
      request.logger
    )

    const status = await db
      .collection('status')
      .findOne({ repositoryName: service })

    expect(status?.repositoryName).toEqual(service)
    expect(status[config.get('github.repos.cdpAppConfig')]?.status).toEqual(
      statuses.requested
    )
    expect(
      status[config.get('github.repos.cdpNginxUpstreams')]?.status
    ).toEqual(statuses.requested)
    expect(status[config.get('github.repos.cdpTfSvcInfra')]?.status).toEqual(
      statuses.requested
    )
    expect(status[config.get('github.repos.cdpGrafanaSvc')]?.status).toEqual(
      statuses.requested
    )
    expect(status[config.get('github.repos.cdpSquidProxy')]?.status).toEqual(
      statuses.requested
    )
    expect(status[config.get('github.repos.createWorkflows')]?.status).toEqual(
      statuses.requested
    )
  })
})
