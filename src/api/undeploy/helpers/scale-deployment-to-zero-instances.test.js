import { scaleDeploymentToZeroInstances } from '~/src/api/undeploy/helpers/scale-deployment-to-zero-instances.js'

const undeploymentId = 'some-undeployment-id'

describe('#scaleDeploymentToZeroInstances', () => {
  test('Should scale to 0', () => {
    const response = scaleDeploymentToZeroInstances(
      {},
      {
        id: 'some-user-id',
        displayName: 'some-name'
      },
      undeploymentId
    )

    expect(response.resources.instanceCount).toBe(0)
  })

  test('Should be done by user', () => {
    const response = scaleDeploymentToZeroInstances(
      {},
      {
        id: 'some-user-id',
        displayName: 'some-name'
      },
      undeploymentId
    )

    expect(response.deploymentId).toBe(undeploymentId)
    expect(response.metadata.user.displayName).toBe('some-name')
  })
})
