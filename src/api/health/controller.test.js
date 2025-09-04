import { describe, expect, test, vi } from 'vitest'
import { healthController } from './controller.js'
import { statusCodes } from '@defra/cdp-validation-kit'

describe('#healthController', () => {
  const mockViewHandler = {
    response: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis()
  }

  test('Should provide expected response', () => {
    healthController.handler(null, mockViewHandler)

    expect(mockViewHandler.response).toHaveBeenCalledWith({
      message: 'success'
    })
    expect(mockViewHandler.code).toHaveBeenCalledWith(statusCodes.ok)
  })
})
