import isNil from 'lodash/isNil.js'

/**
 * Get create service status
 * @param {import('mongodb').Db} db
 * @param {string[]} statuses
 * @param {Record<string, string>} [queryParams]
 * @returns {Promise<*>}
 */
async function getStatus(db, statuses, queryParams = {}) {
  const service = queryParams.service
  const teamId = queryParams.teamId
  const kind = queryParams.kind
  const stages = []

  if (statuses?.length) {
    stages.push({
      $match: { status: { $in: statuses } }
    })
  }

  if (!isNil(kind)) {
    stages.push({
      $match: { kind }
    })
  }

  if (!isNil(teamId)) {
    stages.push({
      $match: { 'team.teamId': teamId }
    })
  }

  if (!isNil(service)) {
    stages.push({
      $match: {
        $or: [{ repositoryName: { $regex: service, $options: 'i' } }]
      }
    })
  }

  stages.push({ $project: { _id: 0 } })

  return await db.collection('status').aggregate(stages).toArray()
}

export { getStatus }
