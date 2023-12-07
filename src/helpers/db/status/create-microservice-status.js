import { statuses } from '~/src/constants/statuses'
import { creations } from '~/src/constants/creations'
import { config } from '~/src/config'

const tfSvcInfra = config.get('githubRepoTfServiceInfra')
const cdpAppConfig = config.get('githubRepoConfig')
const cdpNginxUpstream = config.get('githubRepoNginx')

async function createMicroserviceStatus(
  db,
  org,
  repositoryName,
  payload,
  zone,
  team
) {
  const status = {
    org,
    repositoryName,
    portalVersion: 2,
    kind: creations.microservice,
    status: statuses.inProgress,
    started: new Date(),
    serviceTypeTemplate: payload.serviceTypeTemplate,
    team: {
      teamId: team.teamId,
      name: team.name
    },
    zone,
    createRepository: {
      status: statuses.notRequested
    },
    [tfSvcInfra]: {
      status: statuses.notRequested
    },
    [cdpAppConfig]: {
      status: statuses.notRequested
    },
    [cdpNginxUpstream]: {
      status: statuses.notRequested
    }
  }
  await db.collection('status').insertOne(status)
  return status
}

export { createMicroserviceStatus }
