import { describe, expect, test, vi } from 'vitest'
import { deployServiceOptionsController } from './deploy-service-options.js'
import { ecsCpuToMemoryOptionsMap } from '../helpers/ecs-cpu-to-memory-options-map.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

describe('#deployServiceOptionsController', () => {
  test('Should return success message and CPU options', () => {
    const request = {}
    const h = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn()
    }

    deployServiceOptionsController.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      message: 'success',
      cpuOptions: [
        { value: 512, text: '0.5 vCPU' },
        { value: 1024, text: '1 vCPU' },
        { value: 2048, text: '2 vCPU' },
        { value: 4096, text: '4 vCPU' },
        { value: 8192, text: '8 vCPU' }
      ],
      ecsCpuToMemoryOptionsMap
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.ok)
  })

  test('Should return correct CPU options', () => {
    const request = {}
    const h = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn()
    }

    deployServiceOptionsController.handler(request, h)

    const response = h.response.mock.calls[0][0]
    expect(response.cpuOptions).toEqual([
      { value: 512, text: '0.5 vCPU' },
      { value: 1024, text: '1 vCPU' },
      { value: 2048, text: '2 vCPU' },
      { value: 4096, text: '4 vCPU' },
      { value: 8192, text: '8 vCPU' }
    ])
  })

  test('Should return correct ecsCpuToMemoryOptionsMap', () => {
    const request = {}
    const h = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn()
    }

    deployServiceOptionsController.handler(request, h)

    const response = h.response.mock.calls[0][0]
    expect(response.ecsCpuToMemoryOptionsMap).toBe(ecsCpuToMemoryOptionsMap)
  })
})
