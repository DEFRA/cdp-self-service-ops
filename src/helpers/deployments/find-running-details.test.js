import { fetchRunningServices } from '~/src/helpers/deployments/fetch-running-services.js'
import { findRunningDetails } from '~/src/helpers/deployments/find-running-details.js'
import { vi } from 'vitest'

vi.mock('~/src/helpers/deployments/fetch-running-services.js', () => {
  return {
    fetchRunningServices: vi.fn()
  }
})

const service = 'some-service'
const details = {
  cdpDeploymentId: 'some-id',
  environment: 'dev',
  service
}

describe('#findRunningDetails', () => {
  test('Should return details', async () => {
    fetchRunningServices.mockResolvedValue([details])

    const response = await findRunningDetails(service, 'dev')

    expect(fetchRunningServices).toHaveBeenCalledTimes(1)
    expect(response).toEqual(details)
  })

  test('Should return no details if none found', async () => {
    fetchRunningServices.mockResolvedValue([])

    const response = await findRunningDetails(service, 'dev')

    expect(fetchRunningServices).toHaveBeenCalledTimes(1)
    expect(response).toBeUndefined()
  })

  test('Should return no details if only in other environments', async () => {
    fetchRunningServices.mockResolvedValue([
      { ...details, environment: 'test' }
    ])

    const response = await findRunningDetails(service, 'dev')

    expect(fetchRunningServices).toHaveBeenCalledTimes(1)
    expect(response).toBeUndefined()
  })

  test('Should return only first details if multiple somehow', async () => {
    fetchRunningServices.mockResolvedValue([
      details,
      { ...details, cdpDeploymentId: 'some-other-id' }
    ])

    const response = await findRunningDetails(service, 'dev')

    expect(fetchRunningServices).toHaveBeenCalledTimes(1)
    expect(response).toEqual(details)
  })
})
