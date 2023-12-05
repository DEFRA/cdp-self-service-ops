import { creations } from '~/src/constants/creations'
import { statuses } from '~/src/constants/statuses'

async function createRepositoryStatus(db, org, repositoryName, payload, team) {
  const statusDocument = {
    kind: creations.repository,
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

export { createRepositoryStatus }
