/**
 * Remove status for a repository
 * @param {import('mongodb').Db} db
 * @param {string} repositoryName
 * @returns {Promise<*>}
 */
async function removeStatus(db, repositoryName) {
  return await db.collection('status').deleteMany({ repositoryName })
}

export { removeStatus }
