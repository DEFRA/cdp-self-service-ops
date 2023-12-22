async function getRepositoryStatus(db, repositoryName, statuses) {
  return await db
    .collection('status')
    .findOne(
      { repositoryName, status: { $in: statuses } },
      { projection: { _id: 0 } }
    )
}

export { getRepositoryStatus }
