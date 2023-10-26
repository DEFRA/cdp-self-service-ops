async function statusLookup(db, repo) {
  return await db.collection('status').findOne({ repositoryName: repo })
}

async function findByStatus(db, statues) {
  return await db.collection('status').find({ status: { $in: statues } })
}

export { statusLookup, findByStatus }
