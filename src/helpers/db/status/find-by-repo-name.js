/**
 * Find a single status record for a repository
 * @param db
 * @param repoName
 * @returns {Promise<*>}
 */
async function findByRepoName(db, repoName) {
  return db.collection('status').findOne({ repositoryName: repoName })
}

export { findByRepoName }
