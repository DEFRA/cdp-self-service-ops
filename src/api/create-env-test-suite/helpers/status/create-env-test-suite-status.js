import { config } from '~/src/config'
import { creations } from '~/src/constants/creations'
import { statuses } from '~/src/constants/statuses'

const tfSvcInfra = config.get('githubRepoTfServiceInfra')

async function createEnvTestSuiteStatus(db, org, repositoryName, zone, team) {
  const statusDocument = {
    kind: creations.envTestsuite,
    portalVersion: 2,
    started: new Date(),
    status: statuses.inProgress,
    org,
    repositoryName,
    team: {
      teamId: team.teamId,
      name: team.name
    },
    zone,
    serviceTypeTemplate: 'cdp-node-env-test-suite-template',
    createRepository: {
      status: statuses.notRequested
    },
    [tfSvcInfra]: {
      status: statuses.notRequested
    }
  }

  return await db.collection('status').insertOne(statusDocument)
}

export { createEnvTestSuiteStatus }
