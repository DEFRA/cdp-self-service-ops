import { config } from '~/src/config'
import { MongoClient } from 'mongodb'
import { fetchTeam } from '~/src/helpers/fetch-team'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow'
import { createMicroservice } from '~/src/helpers/create/create-microservice'

jest.mock('~/src/helpers/fetch-team', () => ({
  fetchTeam: jest.fn()
}))

jest.mock(
  '~/src/helpers/create/workflows/create-resource-from-workflow',
  () => ({
    createResourceFromWorkflow: jest.fn()
  })
)

const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
let connection
let db
const service = 'test-service-12345'

beforeEach(async () => {
  await db.collection('status').deleteMany({ repositoryName: service })
})

beforeAll(async () => {
  connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  db = await connection.db(globalThis.__MONGO_DB_NAME__)
})

afterAll(async () => {
  await connection.close()
})

describe('#create-test-runner-suite', () => {
  test('Should create microservice', async () => {
    fetchTeam.mockResolvedValue({
      team: { teamId: '123', name: 'test', github: 'test', serviceCodes: 'TST' }
    })
    // createResourceFromWorkflow.mockResolvedValue()

    const request = {
      db,
      logger
    }

    await createMicroservice(
      request,
      service,
      'cdp-node-frontend-template',
      'public',
      'team',
      { id: '123', displayName: 'test user' }
    )

    expect(createResourceFromWorkflow).toHaveBeenCalledTimes(6)

    // Create repo
    expect(createResourceFromWorkflow).toHaveBeenCalledWith(
      request,
      service,
      config.get('github.org'),
      config.get('github.repos.createWorkflows'),
      'create_microservice.yml',
      {
        serviceTypeTemplate: 'cdp-node-frontend-template',
        repositoryName: service,
        team: 'test',
        additionalGitHubTopics: 'cdp,service,node,frontend'
      }
    )

    // Create infrastructure
    expect(createResourceFromWorkflow).toHaveBeenCalledWith(
      request,
      service,
      config.get('github.org'),
      config.get('github.repos.cdpTfSvcInfra'),
      config.get('workflows.createTenantService'),
      {
        service,
        zone: 'public',
        mongo_enabled: false,
        redis_enabled: true,
        service_code: 'TST'
      }
    )

    // Create App Config
    expect(createResourceFromWorkflow).toHaveBeenCalledWith(
      request,
      service,
      config.get('github.org'),
      config.get('github.repos.cdpAppConfig'),
      config.get('workflows.createAppConfig'),
      {
        service
      }
    )

    // Create Nginx
    expect(createResourceFromWorkflow).toHaveBeenCalledWith(
      request,
      service,
      config.get('github.org'),
      config.get('github.repos.cdpNginxUpstreams'),
      config.get('workflows.createNginxUpstreams'),
      {
        service,
        zone: 'public'
      }
    )

    // Create Squid
    expect(createResourceFromWorkflow).toHaveBeenCalledWith(
      request,
      service,
      config.get('github.org'),
      config.get('github.repos.cdpSquidProxy'),
      config.get('workflows.createSquidConfig'),
      {
        service
      }
    )

    // Create Dashboard
    expect(createResourceFromWorkflow).toHaveBeenCalledWith(
      request,
      service,
      config.get('github.org'),
      config.get('github.repos.cdpGrafanaSvc'),
      config.get('workflows.createDashboard'),
      {
        service,
        service_zone: 'public'
      }
    )
  })
})
