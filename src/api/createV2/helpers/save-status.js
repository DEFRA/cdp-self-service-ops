async function initCreationStatus(db, org, repositoryName, payload, zone) {
  const status = {
    org,
    repositoryName,
    portalVersion: 2,
    status: 'in-progress',
    started: new Date(),
    serviceType: payload.serviceType,
    owningTeam: payload.owningTeam,
    zone,
    createRepository: {
      status: 'not-requested'
    },
    'tf-svc-infra': {
      status: 'not-requested'
    },
    'cdp-app-config': {
      status: 'not-requested'
    },
    'cdp-nginx-upstreams': {
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

function calculateOverallStatus(status) {
  const repoStatus = status.createRepository?.status ?? ''
  const tfSvcInfraStatus = status['tf-svc-infra']?.status ?? ''
  const appConfigStatus = status['cdp-app-config']?.status ?? ''
  const nginxStatus = status['cdp-nginx-upstreams']?.status ?? ''

  // return success if ALL sections are successful
  if (
    repoStatus === 'success' &&
    tfSvcInfraStatus === 'success' &&
    appConfigStatus === 'success' &&
    nginxStatus === 'success'
  ) {
    return 'success'
  }

  // return failure if ANY sections have failed
  if (
    repoStatus === 'failure' ||
    tfSvcInfraStatus === 'failure' ||
    appConfigStatus === 'failure' ||
    nginxStatus === 'failure'
  ) {
    return 'failure'
  }

  // otherwise its probably in progress
  return 'in-progress'
}

async function updateOverallStatus(db, repo) {
  const statusRecord = await db
    .collection('status')
    .findOne({ repositoryName: repo })

  if (statusRecord) {
    const newStatus = calculateOverallStatus(statusRecord)

    await db
      .collection('status')
      .updateOne({ repositoryName: repo }, { $set: { status: newStatus } })
  }
}

export {
  initCreationStatus,
  updateCreationStatus,
  updateOverallStatus,
  calculateOverallStatus
}
