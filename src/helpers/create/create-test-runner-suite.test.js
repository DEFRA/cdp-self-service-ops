import { MongoClient } from 'mongodb'
import { createLogger } from '~/src/helpers/logging/logger'

import { creations } from '~/src/constants/creations'
import { fetchTeam } from '~/src/helpers/fetch-team'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow'
import { config } from '~/src/config'

jest.mock('~/src/helpers/fetch-team', () => ({
  fetchTeam: jest.fn()
}))

jest.mock(
  '~/src/helpers/create/workflows/create-resource-from-workflow',
  () => ({
    createResourceFromWorkflow: jest.fn()
  })
)

const logger = createLogger()
let connection
let db
const service = 'testrepo-12345'

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
  test('Should create test suite', async () => {
    fetchTeam.mockResolvedValue({
      team: { teamId: '123', name: 'test', github: 'test', serviceCodes: 'TST' }
    })
    // createResourceFromWorkflow.mockResolvedValue()

    const request = {
      db,
      logger
    }

    await createTestRunnerSuite(
      request,
      service,
      creations.smokeTestSuite,
      'team',
      { id: '123', displayName: 'test user' },
      'create-smoke-test.yml',
      ['smoke']
    )

    // Create repo
    expect(createResourceFromWorkflow).toHaveBeenCalledWith(
      request,
      service,
      config.get('github.org'),
      config.get('github.repos.createWorkflows'),
      'create-smoke-test.yml',
      {
        repositoryName: service,
        team: 'test',
        additionalGitHubTopics: 'cdp,test,test-suite,smoke'
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
        redis_enabled: false,
        service_code: 'TST',
        test_suite: service
      }
    )
  })
})
