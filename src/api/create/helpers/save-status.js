import { config } from '~/src/config'

async function initCreationStatus(db, repositoryName, payload, zone) {
  const tfSvcInfra = config.get('githubRepoTfServiceInfra')
  const cdpAppConfig = config.get('githubRepoConfig')
  const cdpNginxUpstream = config.get('githubRepoNginx')

  const status = {
    repositoryName,
    started: new Date(),
    zone,
    createRepository: { status: 'not-requested', payload },
    [tfSvcInfra]: {
      status: 'not-requested'
    },
    [cdpAppConfig]: {
      status: 'not-requested'
    },
    [cdpNginxUpstream]: {
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
