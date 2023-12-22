/**
 * Get create service status
 * @param db
 * @param statuses ['in-progress', 'success', 'failure']
 * @returns {Promise<*>}
 */
async function getStatus(db, statuses) {
  const stages = []

  if (statuses?.length) {
    stages.push({
      $match: { status: { $in: statuses } }
    })
  }

  stages.push({ $project: { _id: 0 } })

  return await db.collection('status').aggregate(stages).toArray()
}

export { getStatus }
