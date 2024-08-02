import { config } from '~/src/config'
import { updateCreationStatus } from '~/src/api/create-microservice/helpers/save-status'
import { statuses } from '~/src/constants/statuses'
import { queueEvent } from '~/src/helpers/queued-events/queued-events'

async function queueTfSvcInfra(server, repositoryName, zone, serviceCodes) {
  const tfSvcInfra = config.get('gitHubRepoTfServiceInfra')
  const eventType = config.get('serviceInfraCreateEvent')
  try {
    await updateCreationStatus(server.db, repositoryName, tfSvcInfra, {
      status: statuses.queued
    })
    await queueEvent(
      server.db,
      repositoryName,
      eventType,
      { zone, serviceCodes },
      server.logger
    )
    server.events.emit(eventType)
    server.logger.info(`Queued service infra PR for ${repositoryName}`)
  } catch (e) {
    await updateCreationStatus(server.db, repositoryName, tfSvcInfra, {
      status: statuses.failure,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    server.logger.error(`Update cdp-tf-svc-infra ${repositoryName} failed ${e}`)
  }
}

export { queueTfSvcInfra }
