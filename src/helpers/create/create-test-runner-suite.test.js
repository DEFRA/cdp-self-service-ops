import { MongoClient } from 'mongodb'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { creations } from '~/src/constants/creations.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'
import { triggerWorkflow } from '~/src/helpers/create/workflows/trigger-workflow.js'
import { statuses } from '~/src/constants/statuses.js'

jest.mock('~/src/helpers/fetch-team', () => ({
  fetchTeam: jest.fn()
}))

jest.mock('~/src/helpers/create/workflows/trigger-workflow', () => ({
  triggerWorkflow: jest.fn()
}))

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
  db = connection.db(globalThis.__MONGO_DB_NAME__)
})

afterAll(async () => {
  await connection.close()
})

describe('#create-test-runner-suite', () => {
  test('Should create test suite', async () => {
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
    const createJourneyTestSuiteWorkflow = config.get(
      'workflows.createJourneyTestSuite'
    )

    await createTestRunnerSuite(
      request,
      service,
      creations.journeyTestsuite,
      'team',
      { id: '123', displayName: 'test user' },
      createJourneyTestSuiteWorkflow,
      'cdp-node-env-test-suite-template',
      ['journey']
    )

    // Create repo
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.createWorkflows'),
      'create_journey_test_suite.yml',
      {
        repositoryName: service,
        team: 'test',
        additionalGitHubTopics: 'cdp,test,test-suite,journey'
      }
    )

    // Create Squid
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpSquidProxy'),
      config.get('workflows.createSquidConfig'),
      {
        service
      }
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
        redis_enabled: 'false',
        service_code: 'TST',
        test_suite: service
      }
    )

    const status = await db
      .collection('status')
      .findOne({ repositoryName: service })

    expect(status?.repositoryName).toEqual(service)
    expect(status[config.get('github.repos.cdpTfSvcInfra')]?.status).toEqual(
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
