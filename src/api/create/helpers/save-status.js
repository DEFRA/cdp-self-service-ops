async function initCreationStatus(db, repositoryName, payload, zone) {
  const status = {
    repositoryName,
    started: new Date(),
    zone,
    createRepository: { status: 'not-requested', payload },
    'tf-svc': {
      status: 'not-requested'
    },
    'tf-svc-infra': {
      status: 'not-requested'
    },
    'cdp-app-config': {
      status: 'not-requested'
    }
  }
  await db.collection('status').insertOne(status)
  return status
}

async function updateCreationStatus(db, repo, field, status) {
  return await db
    .collection('status')
    .updateOne({ repositoryName: repo }, { $set: { [field]: status } })
}

export { initCreationStatus, updateCreationStatus }
