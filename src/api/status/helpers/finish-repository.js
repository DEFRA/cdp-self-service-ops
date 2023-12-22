async function finishRepository(db, repositoryName) {
  return await db
    .collection('status')
    .updateOne({ repositoryName }, { $set: { userHasFinished: true } })
}

export { finishRepository }
