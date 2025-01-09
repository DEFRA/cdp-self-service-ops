import { whatsRunningWhere } from '~/src/helpers/deployments/whats-running-where.js'
import { findRunningDetails } from '~/src/helpers/deployments/find-running-details.js'

jest.mock('~/src/helpers/deployments/whats-running-where', () => {
  return {
    whatsRunningWhere: jest.fn()
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
    whatsRunningWhere.mockResolvedValue([details])

    const response = await findRunningDetails(service, 'dev')

    expect(whatsRunningWhere).toHaveBeenCalledTimes(1)
    expect(response).toEqual(details)
  })

  test('Should return no details if none found', async () => {
    whatsRunningWhere.mockResolvedValue([])

    const response = await findRunningDetails(service, 'dev')

    expect(whatsRunningWhere).toHaveBeenCalledTimes(1)
    expect(response).toBeUndefined()
  })

  test('Should return no details if only in other environments', async () => {
    whatsRunningWhere.mockResolvedValue([{ ...details, environment: 'test' }])

    const response = await findRunningDetails(service, 'dev')

    expect(whatsRunningWhere).toHaveBeenCalledTimes(1)
    expect(response).toBeUndefined()
  })

  test('Should return only first details if multiple somehow', async () => {
    whatsRunningWhere.mockResolvedValue([
      details,
      { ...details, cdpDeploymentId: 'some-other-id' }
    ])

    const response = await findRunningDetails(service, 'dev')

    expect(whatsRunningWhere).toHaveBeenCalledTimes(1)
    expect(response).toEqual(details)
  })
})
