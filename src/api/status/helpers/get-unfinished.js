async function getUnfinished(db) {
  const stages = []

  stages.push({
    $match: { userHasFinished: { $eq: false } }
  })

  stages.push({ $project: { _id: 0 } })

  return await db.collection('status').aggregate(stages).toArray()
}

export { getUnfinished }
