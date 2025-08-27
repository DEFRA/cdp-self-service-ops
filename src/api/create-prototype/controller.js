import Boom from '@hapi/boom'
import { prototypeValidation } from './schema/prototype-validation.js'
import { entityTypes } from '../../constants/entities.js'
import { createMicroservice } from '../../helpers/create/create-microservice.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'

const createPrototypeController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, 'team:{payload.teamId}']
      }
    },
    validate: {
      payload: prototypeValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const repositoryName = payload?.repositoryName
    const templateTag = payload?.templateTag
    const user = request.auth?.credentials

    const template = {
      repositoryName: 'cdp-node-prototype-template',
      zone: 'public',
      mongo: false,
      redis: false,
      templateName: 'CDP Node.js Prototype Template',
      language: 'node',
      type: 'prototype',
      id: 'cdp-node-prototype-template',
      entityType: entityTypes.prototype,
      entitySubType: undefined
    }

    await createMicroservice({
      logger: request.logger,
      repositoryName,
      template,
      templateTag,
      teamId: payload?.teamId,
      user
    })

    return h
      .response({
        message: 'Prototype creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(statusCodes.ok)
  }
}

export { createPrototypeController }
