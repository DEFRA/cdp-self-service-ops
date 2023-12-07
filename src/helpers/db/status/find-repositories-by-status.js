/**
 * Get create service status
 * @param db
 * @param statuses ['in-progress', 'success', 'failure']
 * @returns {Promise<*>}
 */
async function findRepositoriesByStatus(db, statuses) {
  return await db
    .collection('status')
    .find(
      { status: { $in: statuses } },
      {
        projection: { _id: 0 }
      }
    )
    .toArray()
}

export { findRepositoriesByStatus }
