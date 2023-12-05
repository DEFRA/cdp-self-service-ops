function updateRepositoryStatus(db, repositoryName) {
  return async (valueObj) =>
    await db
      .collection('status')
      .updateOne({ repositoryName }, { $set: valueObj })
}

export { updateRepositoryStatus }
