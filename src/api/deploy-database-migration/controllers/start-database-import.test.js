import { scopes, statusCodes } from '@defra/cdp-validation-kit'
import { startDatabaseImport } from './start-database-import.js'
import { runDatabaseImport } from '../helpers/run-database-import.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import userHasBreakGlass from '../../../helpers/user/user-has-break-glass.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { betaTesterScope } from '../../../constants/scopes.js'

vi.mock('../helpers/run-database-import.js')
vi.mock('../../../helpers/user/get-scoped-user.js')
vi.mock('../../../helpers/user/user-has-break-glass.js')
vi.mock('../../../helpers/portal-backend/get-entity.js')

const ownerScope = `${scopes.serviceOwner}:team:team-1`

function createResponseToolkit() {
  return {
    response: vi.fn((payload) => ({
      code: (statusCode) => ({ payload, statusCode })
    }))
  }
}

function createRequest({ scope = [], environment = 'dev' } = {}) {
  return {
    payload: {
      service: 'example-service',
      environment,
      path: 'dataset.dump',
      target: 'postgres'
    },
    auth: {
      credentials: {
        id: '123',
        displayName: 'Test User',
        scope
      }
    },
    logger: {
      info: vi.fn(),
      error: vi.fn()
    },
    snsClient: {}
  }
}

describe('startDatabaseImport.handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEntity.mockResolvedValue({ teams: [{ teamId: 'team-1' }] })
    getScopedUser.mockResolvedValue({ id: '123', displayName: 'Test User' })
    runDatabaseImport.mockResolvedValue('import-123')
    userHasBreakGlass.mockReturnValue(true)
  })

  test('starts the import for a beta tester who owns the service', async () => {
    const request = createRequest({ scope: [betaTesterScope, ownerScope] })

    const response = await startDatabaseImport.handler(
      request,
      createResponseToolkit()
    )

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(response.payload).toEqual({ importId: 'import-123' })
  })

  test('rejects a user who is not allowed to import', async () => {
    const request = createRequest({ scope: [ownerScope] })

    await expect(
      startDatabaseImport.handler(request, createResponseToolkit())
    ).rejects.toMatchObject({
      output: { statusCode: statusCodes.forbidden }
    })
    expect(runDatabaseImport).not.toHaveBeenCalled()
  })

  test('rejects prod without break glass', async () => {
    const request = createRequest({
      environment: 'prod',
      scope: [betaTesterScope, ownerScope]
    })
    userHasBreakGlass.mockReturnValue(false)

    const response = await startDatabaseImport.handler(
      request,
      createResponseToolkit()
    )

    expect(response.statusCode).toBe(statusCodes.badRequest)
    expect(response.payload).toEqual({ message: 'Break-glass required' })
    expect(runDatabaseImport).not.toHaveBeenCalled()
  })
})
