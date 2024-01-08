import { creations } from '~/src/constants/creations'
import { statuses } from '~/src/constants/statuses'

async function createTestSuiteStatus(db, org, repositoryName, payload, team) {
  const statusDocument = {
    kind: creations.testsuite,
    portalVersion: 2,
    started: new Date(),
    status: statuses.inProgress,
    org,
    repositoryName,
    team,
    createRepository: {
      status: statuses.notRequested
    }
  }

  return await db.collection('status').insertOne(statusDocument)
}

export { createTestSuiteStatus }
