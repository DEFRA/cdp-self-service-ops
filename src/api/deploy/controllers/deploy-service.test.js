import { statusCodes } from '@defra/cdp-validation-kit'
import { deployService } from './deploy-service.js'
import { registerDeployment } from '../helpers/register-deployment.js'
import { generateDeployment } from '../../../helpers/deployments/generate-deployment.js'
import { commitDeploymentFile } from '../../../helpers/deployments/commit-deployment-file.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'

vi.mock('../helpers/register-deployment.js', () => ({
  registerDeployment: vi.fn()
}))

vi.mock('../../../helpers/deployments/generate-deployment.js', () => ({
  generateDeployment: vi.fn()
}))

vi.mock('../../../helpers/deployments/commit-deployment-file.js', () => ({
  commitDeploymentFile: vi.fn()
}))

vi.mock('../../../helpers/portal-backend/get-entity.js', () => ({
  getEntity: vi.fn()
}))

describe('#deploy-service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  test('should trigger a deployment when the service exists', async () => {
    const deploymentId = '1234567890'

    const payload = {
      imageName: 'cdp-portal-frontend',
      environment: 'dev',
      version: '1.2.3',
      instanceCount: 2,
      cpu: 1024,
      memory: 2048,
      configVersion: 'abc123'
    }
    const logger = { info: vi.fn() }
    const user = { id: 'user-123', displayName: 'Portal User' }

    const code = vi.fn().mockReturnValue('hapi-response')
    const h = {
      response: vi.fn().mockReturnValue({ code })
    }

    getEntity.mockResolvedValue({
      environments: {
        dev: { tenant_config: { zone: 'zone-a' } }
      },
      metadata: { service_code: 'service-code' }
    })
    const generatedDeployment = { deploymentId }
    generateDeployment.mockReturnValue(generatedDeployment)
    registerDeployment.mockResolvedValue()
    commitDeploymentFile.mockResolvedValue()

    const response = await deployService(payload, logger, h, user)

    expect(registerDeployment).toHaveBeenCalledWith(
      payload.imageName,
      payload.version,
      payload.environment,
      payload.instanceCount,
      payload.cpu,
      payload.memory,
      user,
      expect.any(String),
      payload.configVersion
    )
    expect(getEntity).toHaveBeenCalledWith(payload.imageName)
    expect(generateDeployment).toHaveBeenCalledWith({
      deploymentId: expect.any(String),
      payload,
      zone: 'zone-a',
      commitSha: payload.configVersion,
      serviceCode: 'service-code',
      deploy: true,
      user
    })
    expect(commitDeploymentFile).toHaveBeenCalledWith(
      generatedDeployment,
      logger
    )
    expect(h.response).toHaveBeenCalledWith({
      deploymentId: expect.any(String)
    })
    expect(code).toHaveBeenCalledWith(statusCodes.ok)
    expect(response).toEqual('hapi-response')
  })

  test('should not trigger a deployment when the service doesnt exists', async () => {
    const payload = {
      imageName: 'cdp-portal-api',
      environment: 'dev',
      version: '1.2.3',
      instanceCount: 2,
      cpu: 1024,
      memory: 2048,
      configVersion: 'abc123'
    }
    const logger = { info: vi.fn() }
    const user = { id: 'user-123', displayName: 'Portal User' }

    const h = {}

    getEntity.mockRejectedValue('Resource not found')

    const promise = deployService(payload, logger, h, user)
    await expect(promise).rejects.toThrowError()

    expect(registerDeployment).toHaveBeenCalledWith(
      payload.imageName,
      payload.version,
      payload.environment,
      payload.instanceCount,
      payload.cpu,
      payload.memory,
      user,
      expect.any(String),
      payload.configVersion
    )
    expect(generateDeployment).not.toHaveBeenCalled()
    expect(commitDeploymentFile).not.toHaveBeenCalled()
  })
})
