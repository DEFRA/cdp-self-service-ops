import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { createServiceInfrastructurePr } from '~/src/api/create-microservice/helpers/create-service-infrastructure-pr'
import { updateCreationStatus } from '~/src/api/create-microservice/helpers/save-status'
import { trimPr } from '~/src/api/create-microservice/helpers/trim-pr'

const doUpdateTfSvcInfra = async (request, repositoryName, zone) => {
  const tfSvcInfra = config.get('githubRepoTfServiceInfra')
  try {
    const pullRequest = await createServiceInfrastructurePr(
      repositoryName,
      zone
    )
    await updateCreationStatus(request.db, repositoryName, tfSvcInfra, {
      status: statuses.raised,
      pr: trimPr(pullRequest?.data)
    })
    request.logger.info(
      `created service infra PR for ${repositoryName}: ${pullRequest.data.html_url}`
    )
  } catch (e) {
    await updateCreationStatus(request.db, repositoryName, tfSvcInfra, {
      status: statuses.failure,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(
      `update cdp-tf-svc-infra ${repositoryName} failed ${e}`
    )
  }
}

export { doUpdateTfSvcInfra }
