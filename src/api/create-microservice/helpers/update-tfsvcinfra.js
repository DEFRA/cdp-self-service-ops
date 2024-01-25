import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { createServiceInfrastructureCode } from '~/src/api/create-microservice/helpers/create-service-infrastructure-code'
import { updateCreationStatus } from '~/src/api/create-microservice/helpers/save-status'
import { trimPr } from '~/src/api/create-microservice/helpers/trim-pr'

const doUpdateTfSvcInfra = async (request, repositoryName, zone) => {
  const tfSvcInfra = config.get('githubRepoTfServiceInfra')
  try {
    const createServiceInfrastructureCodeResult =
      await createServiceInfrastructureCode(repositoryName, zone)
    await updateCreationStatus(request.db, repositoryName, tfSvcInfra, {
      status: statuses.raised,
      pr: trimPr(createServiceInfrastructureCodeResult?.data)
    })
    request.logger.info(
      `created service infra PR for ${repositoryName}: ${createServiceInfrastructureCodeResult.data.html_url}`
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
