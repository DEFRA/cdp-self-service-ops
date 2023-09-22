async function statusLookup(db, repo) {
  return await db.collection('status').findOne({ repositoryName: repo })
}

export { statusLookup }
