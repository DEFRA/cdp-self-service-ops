import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeDeployment } from '~/src/helpers/remove/workflows/remove-deployment.js'
import { deleteDeploymentFiles } from '~/src/api/undeploy/helpers/delete-deployment-file.js'

jest.mock('~/src/helpers/feature-toggle/is-feature-enabled')
jest.mock('~/src/helpers/deployments/find-running-details')
jest.mock('~/src/helpers/remove/workflows/remove-deployment')

const serviceName = 'some-service'
const logger = { info: jest.fn() }

describe('#deleteDeploymentFiles', () => {
  test('should delete all deployment files for a service', async () => {
    isFeatureEnabled.mockReturnValue(true)

    await deleteDeploymentFiles({ serviceName, logger })

    expect(isFeatureEnabled).toHaveBeenCalledWith(
      featureToggles.undeploy.deleteDeploymentFiles
    )
    expect(removeDeployment).toHaveBeenCalledWith(serviceName, logger)
  })

  test('should not delete deployment file if feature disabled', async () => {
    isFeatureEnabled.mockReturnValue(false)

    await deleteDeploymentFiles({ serviceName, logger })

    expect(removeDeployment).toHaveBeenCalledTimes(0)
  })
})
