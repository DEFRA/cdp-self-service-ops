import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { createEntity } from '~/src/helpers/portal-backend/create-entity.js'
import { entitySubTypes, entityTypes } from '~/src/constants/entities.js'
import { randomUUID } from 'node:crypto'

jest.mock('~/src/helpers/fetch-team')

jest.mock('~/src/helpers/github/trigger-workflow')

jest.mock('~/src/helpers/portal-backend/create-entity.js')

const logger = createLogger()
const service = 'testrepo-12345'

describe('#create-test-runner-suite', () => {
  beforeAll(() => {
    jest.useFakeTimers({ advanceTimers: true })
    jest.setSystemTime(new Date('2025-05-10T14:16:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('Should create test suite', async () => {
    const teamId = randomUUID()
    fetchTeam.mockResolvedValue({
      team: {
        teamId,
        name: 'test',
        github: 'test',
        serviceCodes: ['TST']
      }
    })

    const userId = randomUUID()
    await createTestRunnerSuite({
      logger,
      repositoryName: service,
      entitySubType: entitySubTypes.journey,
      teamId,
      user: { id: userId, displayName: 'test user' },
      templateWorkflow: config.get('workflows.createJourneyTestSuite'),
      templateTag: 'main'
    })

    expect(createEntity).toHaveBeenCalledWith({
      name: service,
      type: entityTypes.testSuite,
      subType: entitySubTypes.journey,
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
      repositoryName: service,
      team: 'test',
      additionalGitHubTopics: 'cdp,test,test-suite,journey',
      templateTag: 'main'
    }

    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.createWorkflows'),
      'create_journey_test_suite.yml',
      createRepoInputs,
      service,
      logger
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

    // Create infrastructure
    const infraInputs = {
      service,
      zone: 'public',
      mongo_enabled: 'false',
      redis_enabled: 'false',
      service_code: 'TST',
      test_suite: service
    }
    expect(triggerWorkflow).toHaveBeenCalledWith(
      config.get('github.org'),
      config.get('github.repos.cdpTfSvcInfra'),
      config.get('workflows.createTenantService'),
      infraInputs,
      service,
      logger
    )
  })
})
