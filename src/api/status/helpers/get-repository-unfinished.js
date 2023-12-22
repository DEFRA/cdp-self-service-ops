async function getRepositoryUnfinished(db, repositoryName) {
  return await db
    .collection('status')
    .findOne(
      { repositoryName, userHasFinished: false },
      { projection: { _id: 0 } }
    )
}

export { getRepositoryUnfinished }
