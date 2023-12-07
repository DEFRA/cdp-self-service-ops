/**
 * returns a single status record where a sub-section's PR number matches
 * @param db
 * @param section which section to search in (e.g. cdp-tf-svc-infra)
 * @param prNumber the github PR id
 * @returns {Promise<status>}
 */
async function findByPrNumber(db, section, prNumber) {
  const searchOn = `${section}.pr.number`
  return db.collection('status').findOne({ [searchOn]: prNumber })
}

export { findByPrNumber }
