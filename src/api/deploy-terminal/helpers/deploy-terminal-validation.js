import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'
import { toolConfig } from './tool-config.js'

export const deployTerminalValidation = Joi.object({
  service: repositoryNameValidation,
  environment: environmentValidation,
  teamIds: Joi.array().items(Joi.string().required()).min(1).required(),
  expiresAt: Joi.date().iso().optional(),
  tool: Joi.string()
    .valid(...Object.keys(toolConfig))
    .default('terminal')
})
