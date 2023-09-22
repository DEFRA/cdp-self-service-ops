async function findByPrNumber(db, repo, prNumber) {
  const searchOn = `${repo}.pr.number`
  return db.collection('status').findOne({ [searchOn]: prNumber })
}

async function findByCommitHash(db, repo, sha) {
  const searchOn = `${repo}.merged_sha`
  return db.collection('status').findOne({ [searchOn]: sha })
}

async function updatePrStatus(db, repo, field, status, mergedSha) {
  const statusField = `${field}.status`
  const mergedShaField = `${field}.merged_sha`

  return db
    .collection('status')
    .updateOne(
      { repositoryName: repo },
      { $set: { [statusField]: status, [mergedShaField]: mergedSha } }
    )
}

async function updateWorkflowStatus(db, repo, field, status, workflowStatus) {
  const statusField = `${field}.status`
  const workflowField = `${field}.workflow`
  return db
    .collection('status')
    .updateOne(
      { repositoryName: repo },
      { $set: { [statusField]: status, [workflowField]: workflowStatus } }
    )
}

export {
  updatePrStatus,
  updateWorkflowStatus,
  findByCommitHash,
  findByPrNumber
}
