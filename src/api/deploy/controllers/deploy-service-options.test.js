import { deployServiceOptionsController } from './deploy-service-options.js'
import {
  ecsCpuToMemoryOptionsMap,
  prototypeCpuToMemoryOptionsMap
} from '../helpers/ecs-cpu-to-memory-options-map.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import { entitySubTypes } from '@defra/cdp-validation-kit/src/constants/entities.js'
import * as Hapi from '@hapi/hapi'

let server

beforeEach(async () => {
  server = Hapi.server()
  server.route({
    method: 'GET',
    path: '/deploy-service/options',
    ...deployServiceOptionsController
  })
})

afterEach(async () => {
  await server.stop()
})

const getDeployServiceOptions = (subtype) =>
  server.inject({
    method: 'GET',
    url: subtype
      ? `/deploy-service/options?subtype=${subtype}`
      : `/deploy-service/options`
  })

describe('#deployServiceOptionsController', () => {
  test('Should return CPU options and ecsCpuToMemoryOptionsMap', async () => {
    const response = await getDeployServiceOptions()

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(JSON.parse(response.payload)).toEqual({
      cpuOptions: [
        { value: 512, text: '0.5 vCPU' },
        { value: 1024, text: '1 vCPU' },
        { value: 2048, text: '2 vCPU' },
        { value: 4096, text: '4 vCPU' },
        { value: 8192, text: '8 vCPU' }
      ],
      ecsCpuToMemoryOptionsMap
    })
  })

  test('Should return correct ecsCpuToMemoryOptionsMap for frontend subtype', async () => {
    const response = await getDeployServiceOptions(entitySubTypes.frontend)
    const body = JSON.parse(response.payload)

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(body.ecsCpuToMemoryOptionsMap).toEqual(ecsCpuToMemoryOptionsMap)
  })

  test('Should return correct ecsCpuToMemoryOptionsMap for backend subtype', async () => {
    const response = await getDeployServiceOptions(entitySubTypes.backend)
    const body = JSON.parse(response.payload)

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(body.ecsCpuToMemoryOptionsMap).toEqual(ecsCpuToMemoryOptionsMap)
  })

  test('Should return correct ecsCpuToMemoryOptionsMap for prototype subtype', async () => {
    const response = await getDeployServiceOptions(entitySubTypes.prototype)
    const body = JSON.parse(response.payload)

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(body.ecsCpuToMemoryOptionsMap).toEqual(
      prototypeCpuToMemoryOptionsMap
    )
  })

  test('Should return 400 on unsupported subtype', async () => {
    const response = await getDeployServiceOptions(entitySubTypes.journey)
    expect(response.statusCode).toBe(statusCodes.badRequest)
  })
})
