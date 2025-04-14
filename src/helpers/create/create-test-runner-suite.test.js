import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { creations } from '~/src/constants/creations.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { createLegacyStatus } from '~/src/helpers/portal-backend/legacy-status/create-legacy-status.js'
import { updateLegacyStatus } from '~/src/helpers/portal-backend/legacy-status/update-legacy-status.js'
import { statuses } from '~/src/constants/statuses.js'
import { calculateOverallStatus } from '~/src/helpers/portal-backend/legacy-status/calculate-overall-status.js'

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

const logger = createLogger()
const service = 'testrepo-12345'

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

    const createJourneyTestSuiteWorkflow = config.get(
      'workflows.createJourneyTestSuite'
    )

    await createTestRunnerSuite(
      logger,
      service,
      creations.journeyTestsuite,
      'team',
      { id: '123', displayName: 'test user' },
      createJourneyTestSuiteWorkflow,
      'cdp-node-env-test-suite-template',
      'main',
      ['journey']
    )

    expect(createLegacyStatus).toHaveBeenCalledTimes(1)

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

    expect(updateLegacyStatus).toHaveBeenCalledWith(
      service,
      config.get('github.repos.createWorkflows'),
      {
        status: statuses.requested,
        trigger: {
          org: config.get('github.org'),
          repo: config.get('github.repos.createWorkflows'),
          workflow: 'create_journey_test_suite.yml',
          inputs: createRepoInputs
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

    expect(calculateOverallStatus).toHaveBeenCalledWith(service)
  })
})
