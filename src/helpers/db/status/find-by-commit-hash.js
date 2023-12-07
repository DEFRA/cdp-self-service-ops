/**
 *
 * @param db
 * @param section which sub-section to search in (e.g. cdp-app-config)
 * @param commitHash github commit hash
 * @returns {Promise<*>}
 */
async function findByCommitHash(db, section, commitHash) {
  const searchOn = `${section}.merged_sha`
  return db.collection('status').findOne({ [searchOn]: commitHash })
}

export { findByCommitHash }
