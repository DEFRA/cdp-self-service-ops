import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'

const tfSvcInfra = config.get('githubRepoTfServiceInfra')

async function createTestSuiteStatus(
  db,
  org,
  repositoryName,
  zone,
  team,
  kind,
  serviceTypeTemplate
) {
  const statusDocument = {
    kind,
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
    serviceTypeTemplate,
    createRepository: {
      status: statuses.notRequested
    },
    [tfSvcInfra]: {
      status: statuses.notRequested
    }
  }

  return await db.collection('status').insertOne(statusDocument)
}

export { createTestSuiteStatus }
