import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { creations } from '~/src/constants/creations'

const tfSvcInfra = config.get('githubRepoTfServiceInfra')
const cdpAppConfig = config.get('githubRepoConfig')
const cdpNginxUpstream = config.get('githubRepoNginx')

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

// TODO combine this and new update-repository-status work
async function updateCreationStatus(db, repo, field, status) {
  return await db
    .collection('status')
    .updateOne({ repositoryName: repo }, { $set: { [field]: status } })
}

function calculateOverallStatus(status) {
  const repoStatus = status.createRepository?.status ?? ''
  const tfSvcInfraStatus = status[tfSvcInfra]?.status ?? ''
  const appConfigStatus = status[cdpAppConfig]?.status ?? ''
  const nginxStatus = status[cdpNginxUpstream]?.status ?? ''

  // return success if ALL sections are successful
  if (
    repoStatus === statuses.success &&
    tfSvcInfraStatus === statuses.success &&
    appConfigStatus === statuses.success &&
    nginxStatus === statuses.success
  ) {
    return statuses.success
  }

  // return failure if ANY sections have failed
  if (
    repoStatus === statuses.failure ||
    tfSvcInfraStatus === statuses.failure ||
    appConfigStatus === statuses.failure ||
    nginxStatus === statuses.failure
  ) {
    return statuses.failure
  }

  // otherwise its probably in progress
  return statuses.inProgress
}

// TODO combine this and new update-repository-status work
async function updateOverallStatus(db, repo) {
  const statusRecord = await db
    .collection('status')
    .findOne({ repositoryName: repo })

  if (statusRecord) {
    const newStatus = calculateOverallStatus(statusRecord)

    await db
      .collection('status')
      .updateOne({ repositoryName: repo }, { $set: { status: newStatus } })
  }
}

export {
  initCreationStatus,
  updateCreationStatus,
  updateOverallStatus,
  calculateOverallStatus
}
