import { updateTfSvcInfra } from '~/src/api/create-microservice/helpers/update-tfsvcinfra'
import {
  getNextQueuedEvent,
  ackEvent
} from '~/src/helpers/queued-events/queued-events'
import { getRepositoryStatus } from '~/src/api/status/helpers/get-repository-status'
import { statuses } from '~/src/constants/statuses'
import { config } from '~/src/config'

const createServiceInfra = {
  plugin: {
    name: 'createServiceInfra',
    version: '0.1.0',
    register: async (server) => {
      const eventType = config.get('serviceInfraCreateEvent')

      server.event(eventType)
      server.events.on(eventType, async () => {
        const tfSvcInfra = config.get('gitHubRepoTfServiceInfra')
        server.logger.info('Handling request to create service infrastructure')
        const queuedEvent = await getNextQueuedEvent(
          server.db,
          eventType,
          server.logger
        )
        if (queuedEvent) {
          const repositoryStatus = await getRepositoryStatus(
            server.db,
            queuedEvent.repositoryName,
            [statuses.inProgress, statuses.success, statuses.failure]
          )
          const tfstatus = repositoryStatus[tfSvcInfra]
          if (tfstatus?.status === statuses.queued) {
            server.logger.info(
              `Creating service terraform for ${queuedEvent.repositoryName}`
            )
            await updateTfSvcInfra(
              server,
              queuedEvent.repositoryName,
              queuedEvent.item.zone,
              getServiceCode(queuedEvent.item.serviceCodes, server.logger)
            )
          } else {
            server.logger.info(
              `${tfSvcInfra} status for ${queuedEvent.repositoryName} is ${tfstatus?.status} - removing from queue`
            )
            await ackEvent(server.db, queuedEvent.repositoryName, eventType)
          }
        }
      })
    }
  }
}

function getServiceCode(serviceCodes, logger) {
  if (serviceCodes?.at(0)) {
    const [serviceCode, unexpectedServiceCode] = serviceCodes
    // serviceCodes is a list as teams might have more than one service code.
    if (unexpectedServiceCode) {
      logger.Error(
        `More than one service code found - ${serviceCodes}, '${serviceCode} will be used`
      )
    }
    return serviceCode
  }
}

export { createServiceInfra }
