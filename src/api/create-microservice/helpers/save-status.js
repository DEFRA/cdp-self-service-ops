import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { creations } from '~/src/constants/creations'

const tfSvcInfra = config.get('githubRepoTfServiceInfra')
const cdpAppConfig = config.get('githubRepoConfig')
const cdpNginxUpstream = config.get('githubRepoNginx')

function getStatusKeys(statusRecord) {
  const statusKeys = []

  if (statusRecord?.kind === creations.repository) {
    statusKeys.push('createRepository')
  }

  if (statusRecord?.kind === creations.envtestsuite) {
    statusKeys.push('createRepository', tfSvcInfra)
  }

  if (statusRecord?.kind === creations.microservice) {
    statusKeys.push(
      'createRepository',
      cdpNginxUpstream,
      cdpAppConfig,
      tfSvcInfra
    )
  }

  return statusKeys
}

function calculateOverallStatus(
  statusRecord,
  statusKeys = getStatusKeys(statusRecord)
) {
  const allSuccess = statusKeys.every(
    (key) => statusRecord[key]?.status === statuses.success
  )
  const anyFailed = statusKeys.some(
    (key) => statusRecord[key]?.status === statuses.failure
  )

  if (allSuccess) {
    return statuses.success
  }

  if (anyFailed) {
    return statuses.failure
  }

  return statuses.inProgress
}

async function initCreationStatus(
  db,
  org,
  repositoryName,
  payload,
  zone,
  team
) {
  const status = {
    org,
    repositoryName,
    portalVersion: 2,
    kind: creations.microservice,
    status: statuses.inProgress,
    started: new Date(),
    serviceTypeTemplate: payload.serviceTypeTemplate,
    team: {
      teamId: team.teamId,
      name: team.name
    },
    zone,
    createRepository: {
      status: statuses.notRequested
    },
    [tfSvcInfra]: {
      status: statuses.notRequested
    },
    [cdpAppConfig]: {
      status: statuses.notRequested
    },
    [cdpNginxUpstream]: {
      status: statuses.notRequested
    }
  }
  await db.collection('status').insertOne(status)
  return status
}

async function updateCreationStatus(db, repo, field, status) {
  return await db
    .collection('status')
    .updateOne({ repositoryName: repo }, { $set: { [field]: status } })
}

async function updateOverallStatus(db, repositoryName) {
  const statusRecord = await db.collection('status').findOne({ repositoryName })

  if (statusRecord) {
    const overallStatus = calculateOverallStatus(statusRecord)

    await db
      .collection('status')
      .updateOne({ repositoryName }, { $set: { status: overallStatus } })
  }
}

export {
  initCreationStatus,
  updateCreationStatus,
  updateOverallStatus,
  calculateOverallStatus
}
