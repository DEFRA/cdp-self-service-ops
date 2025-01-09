import isNil from 'lodash/isNil.js'

/**
 * @param {import('mongodb').Db} db
 * @param {string[]} statuses
 * @param {Record<string, string>} [queryParams]
 * @returns {Promise<*>}
 */
async function getStatusFilters(db, statuses, queryParams = {}) {
  const kind = queryParams.kind

  const stages = []

  if (!isNil(kind)) {
    stages.push({
      $match: { kind }
    })
  }

  stages.push(
    {
      $match: { status: { $in: statuses } }
    },
    {
      $group: {
        _id: null,
        services: { $addToSet: '$repositoryName' },
        teams: { $addToSet: '$team' }
      }
    },
    {
      $project: {
        _id: 0,
        services: 1,
        teams: {
          teamId: 1,
          name: 1
        }
      }
    }
  )

  const filters = await db.collection('status').aggregate(stages).toArray()
  return filters.at(0)
}

export { getStatusFilters }
