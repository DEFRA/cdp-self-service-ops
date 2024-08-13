/**
 * Get create service status
 * @param {import('mongodb').Db} db
 * @param {string} repositoryName
 * @param {string[]} statuses
 * @returns {Promise<*>}
 */
async function getRepositoryStatus(db, repositoryName, statuses) {
  return await db
    .collection('status')
    .findOne(
      { repositoryName, status: { $in: statuses } },
      { projection: { _id: 0 } }
    )
}

export { getRepositoryStatus }
