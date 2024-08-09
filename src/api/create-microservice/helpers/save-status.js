import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { creations } from '~/src/constants/creations'

const cdptfSvcInfra = config.get('github.repos.cdpTfSvcInfra')
const cdpAppConfig = config.get('github.repos.cdpAppConfig')
const cdpNginxUpstream = config.get('github.repos.cdpNginxUpstreams')
const cdpSquidConfig = config.get('github.repos.cdpSquidProxy')
const cdpDashboards = config.get('github.repos.cdpGrafanaSvc')
const cdpCreateWorkflows = config.get('github.repos.createWorkflows')

function getStatusKeys(statusRecord) {
  switch (statusRecord?.kind) {
    case creations.repository:
    case creations.testsuite:
      return [cdpCreateWorkflows]

    case creations.envTestsuite:
    case creations.smokeTestSuite:
    case creations.perfTestsuite:
      return [cdpCreateWorkflows, cdptfSvcInfra, cdpSquidConfig]

    case creations.microservice:
      return [
        cdpCreateWorkflows,
        cdpNginxUpstream,
        cdpAppConfig,
        cdptfSvcInfra,
        cdpSquidConfig,
        cdpDashboards
      ]
    default:
      return []
  }
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

// TODO: parameterize the tracking fields and use in both microservice and test suite creation
async function initCreationStatus(
  db,
  org,
  repositoryName,
  payload,
  zone,
  team,
  user
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
    creator: user,
    zone,
    [cdpCreateWorkflows]: {
      status: statuses.notRequested
    },
    [cdptfSvcInfra]: {
      status: statuses.notRequested
    },
    [cdpAppConfig]: {
      status: statuses.notRequested
    },
    [cdpNginxUpstream]: {
      status: statuses.notRequested
    },
    [cdpSquidConfig]: {
      status: statuses.notRequested
    },
    [cdpDashboards]: {
      statuses: statuses.notRequested
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
