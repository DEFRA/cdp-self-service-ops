/**
 * Get create service status
 * @param db
 * @param statues ['in-progress', 'success', 'failure']
 * @returns {Promise<*>}
 */
async function getRepositoriesStatuses(db, statues) {
  const stages = []

  if (statues?.length) {
    stages.push({
      $match: { status: { $in: statues } }
    })
  }

  stages.push({ $project: { _id: 0 } })

  return await db.collection('status').aggregate(stages).toArray()
}

export { getRepositoriesStatuses }
