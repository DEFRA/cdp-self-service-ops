import { creations } from '~/src/constants/creations'
import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'

const tfSvcInfra = config.get('githubRepoTfServiceInfra')
const cdpAppConfig = config.get('githubRepoConfig')
const cdpNginxUpstream = config.get('githubRepoNginx')

function getStatusKeys(statusRecord) {
  const statusKeys = []

  if (statusRecord?.kind === creations.repository) {
    statusKeys.push('createRepository')
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

async function updateOverallStatus(db, repositoryName) {
  const statusRecord = await db.collection('status').findOne({ repositoryName })

  if (statusRecord) {
    const overallStatus = calculateOverallStatus(statusRecord)

    await db
      .collection('status')
      .updateOne({ repositoryName }, { $set: { status: overallStatus } })
  }
}

export { calculateOverallStatus, updateOverallStatus }
