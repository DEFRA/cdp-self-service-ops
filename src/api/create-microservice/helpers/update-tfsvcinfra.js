import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { createServiceInfrastructurePr } from '~/src/api/create-microservice/helpers/create-service-infrastructure-pr'
import { updateCreationStatus } from '~/src/api/create-microservice/helpers/save-status'
import { trimPr } from '~/src/api/create-microservice/helpers/trim-pr'

async function updateTfSvcInfra(server, repositoryName, zone, serviceCode) {
  const tfSvcInfra = config.get('gitHubRepoTfServiceInfra')
  try {
    const pullRequest = await createServiceInfrastructurePr(
      repositoryName,
      zone,
      serviceCode
    )
    await updateCreationStatus(server.db, repositoryName, tfSvcInfra, {
      status: statuses.raised,
      pr: trimPr(pullRequest?.data)
    })
    server.logger.info(
      `Created service infra PR for ${repositoryName}: ${pullRequest.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(server.db, repositoryName, tfSvcInfra, {
      status: statuses.failure,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    server.logger.error(`Update cdp-tf-svc-infra ${repositoryName} failed ${e}`)
  }
}

export { updateTfSvcInfra }
