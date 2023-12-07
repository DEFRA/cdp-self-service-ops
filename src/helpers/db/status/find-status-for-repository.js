async function findStatusForRepository(db, repositoryName) {
  return await db
    .collection('status')
    .findOne({ repositoryName }, { projection: { _id: 0 } })
}

export { findStatusForRepository }
