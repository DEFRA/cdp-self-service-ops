import { config } from '~/src/config'

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
    status: 'in-progress',
    started: new Date(),
    serviceType: payload.serviceType,
    team: {
      teamId: team.teamId,
      name: team.name
    },
    zone,
    createRepository: {
      status: 'not-requested'
    },
    [tfSvcInfra]: {
      status: 'not-requested'
    },
    [cdpAppConfig]: {
      status: 'not-requested'
    },
    [cdpNginxUpstream]: {
      status: 'not-requested'
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

function calculateOverallStatus(status) {
  const repoStatus = status.createRepository?.status ?? ''
  const tfSvcInfraStatus = status[tfSvcInfra]?.status ?? ''
  const appConfigStatus = status[cdpAppConfig]?.status ?? ''
  const nginxStatus = status[cdpNginxUpstream]?.status ?? ''

  // return success if ALL sections are successful
  if (
    repoStatus === 'success' &&
    tfSvcInfraStatus === 'success' &&
    appConfigStatus === 'success' &&
    nginxStatus === 'success'
  ) {
    return 'success'
  }

  // return failure if ANY sections have failed
  if (
    repoStatus === 'failure' ||
    tfSvcInfraStatus === 'failure' ||
    appConfigStatus === 'failure' ||
    nginxStatus === 'failure'
  ) {
    return 'failure'
  }

  // otherwise its probably in progress
  return 'in-progress'
}

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
